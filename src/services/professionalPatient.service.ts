import type { DailyCheckin } from '@/src/domain/checkin';
import type { LinkedPatientSummary } from '@/src/domain/professionalLink';
import type { UserProfile } from '@/src/domain/user';
import { listCheckinsByUser } from '@/src/services/checkin.service';
import {
  getActiveLink,
  listLinksForProfessional,
} from '@/src/services/professionalLink.service';
import { getUserProfile } from '@/src/services/user.service';

/**
 * Lista pacientes com vínculo active (perfil básico + link).
 * Requer rules permitindo leitura do user do paciente pelo profissional vinculado.
 */
export async function listActivePatients(
  professionalId: string,
): Promise<LinkedPatientSummary[]> {
  const links = await listLinksForProfessional(professionalId, 'active');
  const results: LinkedPatientSummary[] = [];

  for (const link of links) {
    if (!link.patientId) {
      continue;
    }

    const patient = await getUserProfile(link.patientId);
    if (!patient || patient.role !== 'paciente') {
      continue;
    }

    results.push({
      link,
      patient: {
        uid: patient.uid,
        name: patient.name,
        email: patient.email,
      },
    });
  }

  return results;
}

export async function getPatientProfileIfLinked(
  professionalId: string,
  patientId: string,
): Promise<UserProfile | null> {
  const link = await getActiveLink(professionalId, patientId);
  if (!link) {
    return null;
  }

  const profile = await getUserProfile(patientId);
  if (!profile || profile.role !== 'paciente') {
    return null;
  }

  return profile;
}

export async function listPatientCheckinsIfLinked(
  professionalId: string,
  patientId: string,
  maxItems = 60,
): Promise<DailyCheckin[]> {
  const link = await getActiveLink(professionalId, patientId);
  if (!link) {
    throw new Error('Não há vínculo ativo com este paciente.');
  }

  return listCheckinsByUser(patientId, maxItems);
}
