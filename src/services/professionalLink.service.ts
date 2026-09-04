import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import {
  type InvitePatientInput,
  type LinkRevokedBy,
  type LinkStatus,
  type ProfessionalPatientLink,
  buildActiveLinkId,
  buildPendingLinkId,
  isLinkStatus,
  normalizePatientEmail,
} from '@/src/domain/professionalLink';
import { getUserProfile } from '@/src/services/user.service';
import { db } from '@/src/services/firebase';

const COLLECTION = 'professionalPatientLinks';

function asDate(value: unknown, fallback: Date): Date {
  return value instanceof Timestamp ? value.toDate() : fallback;
}

function mapLink(
  id: string,
  data: Record<string, unknown>,
): ProfessionalPatientLink | null {
  if (
    typeof data.professionalId !== 'string' ||
    typeof data.patientEmail !== 'string' ||
    !isLinkStatus(data.status)
  ) {
    return null;
  }

  const patientId =
    data.patientId === null || data.patientId === undefined
      ? null
      : typeof data.patientId === 'string'
        ? data.patientId
        : null;

  if (data.patientId !== null && data.patientId !== undefined && patientId === null) {
    return null;
  }

  const revokedByRaw = data.revokedBy;
  const revokedBy: LinkRevokedBy | null =
    revokedByRaw === 'profissional' || revokedByRaw === 'paciente'
      ? revokedByRaw
      : null;

  const createdAt = asDate(data.createdAt, new Date());
  const updatedAt = asDate(data.updatedAt, createdAt);
  const acceptedAt =
    data.acceptedAt instanceof Timestamp ? data.acceptedAt.toDate() : null;
  const revokedAt =
    data.revokedAt instanceof Timestamp ? data.revokedAt.toDate() : null;

  return {
    id,
    professionalId: data.professionalId,
    patientId,
    patientEmail: data.patientEmail,
    status: data.status,
    createdAt,
    updatedAt,
    acceptedAt,
    revokedBy,
    revokedAt,
  };
}

async function getLinkById(
  linkId: string,
): Promise<ProfessionalPatientLink | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, linkId));
  if (!snapshot.exists()) {
    return null;
  }
  return mapLink(snapshot.id, snapshot.data() as Record<string, unknown>);
}

async function assertProfessional(professionalId: string): Promise<void> {
  const profile = await getUserProfile(professionalId);
  if (!profile || profile.role !== 'profissional') {
    throw new Error('Apenas profissionais podem gerenciar vínculos.');
  }
}

async function assertPatient(patientId: string): Promise<void> {
  const profile = await getUserProfile(patientId);
  if (!profile || profile.role !== 'paciente') {
    throw new Error('Apenas pacientes podem aceitar ou recusar convites.');
  }
}

/**
 * Cria (ou reabre) convite pendente por e-mail.
 * Se já existir vínculo active para o mesmo e-mail, falha.
 */
export async function invitePatientByEmail(
  input: InvitePatientInput,
): Promise<ProfessionalPatientLink> {
  const patientEmail = normalizePatientEmail(input.patientEmail);
  if (!patientEmail || !patientEmail.includes('@')) {
    throw new Error('Informe um e-mail válido do paciente.');
  }

  await assertProfessional(input.professionalId);

  const existingForProfessional = await listLinksForProfessional(
    input.professionalId,
  );
  const blocking = existingForProfessional.find(
    (link) =>
      link.patientEmail === patientEmail &&
      (link.status === 'pending' || link.status === 'active'),
  );
  if (blocking?.status === 'active') {
    throw new Error('Já existe um vínculo ativo com este paciente.');
  }
  if (blocking?.status === 'pending') {
    return blocking;
  }

  const pendingId = buildPendingLinkId(input.professionalId, patientEmail);
  const ref = doc(db, COLLECTION, pendingId);
  const existingPending = await getDoc(ref);

  if (existingPending.exists()) {
    const existing = mapLink(
      existingPending.id,
      existingPending.data() as Record<string, unknown>,
    );
    if (existing?.status === 'rejected' || existing?.status === 'revoked') {
      await deleteDoc(ref);
    }
  }

  await setDoc(ref, {
    professionalId: input.professionalId,
    patientId: null,
    patientEmail,
    status: 'pending' satisfies LinkStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    acceptedAt: null,
    revokedAt: null,
    revokedBy: null,
  });

  const saved = await getLinkById(pendingId);
  if (!saved) {
    throw new Error('Não foi possível carregar o convite criado.');
  }
  return saved;
}

export async function listLinksForProfessional(
  professionalId: string,
  status?: LinkStatus,
): Promise<ProfessionalPatientLink[]> {
  const constraints = status
    ? [
        where('professionalId', '==', professionalId),
        where('status', '==', status),
        orderBy('updatedAt', 'desc'),
      ]
    : [
        where('professionalId', '==', professionalId),
        orderBy('updatedAt', 'desc'),
      ];

  const snapshot = await getDocs(query(collection(db, COLLECTION), ...constraints));
  const items: ProfessionalPatientLink[] = [];

  snapshot.forEach((item) => {
    const mapped = mapLink(item.id, item.data() as Record<string, unknown>);
    if (mapped) {
      items.push(mapped);
    }
  });

  return items;
}

export async function listPendingInvitesForPatient(
  patientEmail: string,
): Promise<ProfessionalPatientLink[]> {
  const email = normalizePatientEmail(patientEmail);
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION),
      where('patientEmail', '==', email),
      where('status', '==', 'pending'),
      orderBy('updatedAt', 'desc'),
    ),
  );

  const items: ProfessionalPatientLink[] = [];
  snapshot.forEach((item) => {
    const mapped = mapLink(item.id, item.data() as Record<string, unknown>);
    if (mapped) {
      items.push(mapped);
    }
  });
  return items;
}

export async function listLinksForPatient(
  patientId: string,
  status?: LinkStatus,
): Promise<ProfessionalPatientLink[]> {
  const constraints = status
    ? [
        where('patientId', '==', patientId),
        where('status', '==', status),
        orderBy('updatedAt', 'desc'),
      ]
    : [
        where('patientId', '==', patientId),
        orderBy('updatedAt', 'desc'),
      ];

  const snapshot = await getDocs(query(collection(db, COLLECTION), ...constraints));
  const items: ProfessionalPatientLink[] = [];

  snapshot.forEach((item) => {
    const mapped = mapLink(item.id, item.data() as Record<string, unknown>);
    if (mapped) {
      items.push(mapped);
    }
  });

  return items;
}

/**
 * Aceita convite pendente: cria doc ativo `{professionalId}_{patientId}`
 * e remove o doc pending.
 */
export async function acceptLink(
  pendingLinkId: string,
  patientId: string,
): Promise<ProfessionalPatientLink> {
  await assertPatient(patientId);

  const patient = await getUserProfile(patientId);
  if (!patient) {
    throw new Error('Perfil do paciente não encontrado.');
  }

  const pending = await getLinkById(pendingLinkId);
  if (!pending || pending.status !== 'pending') {
    throw new Error('Convite não encontrado ou já processado.');
  }

  if (pending.patientEmail !== normalizePatientEmail(patient.email)) {
    throw new Error('Este convite não corresponde ao seu e-mail.');
  }

  const activeId = buildActiveLinkId(pending.professionalId, patientId);
  const activeRef = doc(db, COLLECTION, activeId);

  await setDoc(activeRef, {
    professionalId: pending.professionalId,
    patientId,
    patientEmail: pending.patientEmail,
    status: 'active' satisfies LinkStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    acceptedAt: serverTimestamp(),
    revokedAt: null,
    revokedBy: null,
  });

  await deleteDoc(doc(db, COLLECTION, pendingLinkId));

  const saved = await getLinkById(activeId);
  if (!saved) {
    throw new Error('Não foi possível carregar o vínculo ativo.');
  }
  return saved;
}

export async function rejectLink(
  pendingLinkId: string,
  patientId: string,
): Promise<ProfessionalPatientLink> {
  await assertPatient(patientId);

  const patient = await getUserProfile(patientId);
  if (!patient) {
    throw new Error('Perfil do paciente não encontrado.');
  }

  const pending = await getLinkById(pendingLinkId);
  if (!pending || pending.status !== 'pending') {
    throw new Error('Convite não encontrado ou já processado.');
  }

  if (pending.patientEmail !== normalizePatientEmail(patient.email)) {
    throw new Error('Este convite não corresponde ao seu e-mail.');
  }

  await updateDoc(doc(db, COLLECTION, pendingLinkId), {
    status: 'rejected' satisfies LinkStatus,
    patientId,
    updatedAt: serverTimestamp(),
  });

  const saved = await getLinkById(pendingLinkId);
  if (!saved) {
    throw new Error('Não foi possível carregar o convite recusado.');
  }
  return saved;
}

/**
 * Cancela convite pendente (profissional) ou revoga vínculo active (ambos).
 */
export async function revokeLink(
  linkId: string,
  actorId: string,
  actorRole: 'profissional' | 'paciente',
): Promise<ProfessionalPatientLink> {
  const link = await getLinkById(linkId);
  if (!link) {
    throw new Error('Vínculo não encontrado.');
  }

  if (link.status === 'pending') {
    if (actorRole !== 'profissional' || actorId !== link.professionalId) {
      throw new Error('Apenas o profissional pode cancelar o convite pendente.');
    }
    await updateDoc(doc(db, COLLECTION, linkId), {
      status: 'revoked' satisfies LinkStatus,
      revokedAt: serverTimestamp(),
      revokedBy: 'profissional' satisfies LinkRevokedBy,
      updatedAt: serverTimestamp(),
    });
  } else if (link.status === 'active') {
    const isProfessional =
      actorRole === 'profissional' && actorId === link.professionalId;
    const isPatient =
      actorRole === 'paciente' && actorId === link.patientId;
    if (!isProfessional && !isPatient) {
      throw new Error('Sem permissão para revogar este vínculo.');
    }

    await updateDoc(doc(db, COLLECTION, linkId), {
      status: 'revoked' satisfies LinkStatus,
      revokedAt: serverTimestamp(),
      revokedBy: actorRole satisfies LinkRevokedBy,
      updatedAt: serverTimestamp(),
    });
  } else {
    throw new Error('Este vínculo não pode ser revogado.');
  }

  const saved = await getLinkById(linkId);
  if (!saved) {
    throw new Error('Não foi possível carregar o vínculo atualizado.');
  }
  return saved;
}

export async function getActiveLink(
  professionalId: string,
  patientId: string,
): Promise<ProfessionalPatientLink | null> {
  const link = await getLinkById(buildActiveLinkId(professionalId, patientId));
  if (!link || link.status !== 'active') {
    return null;
  }
  return link;
}
