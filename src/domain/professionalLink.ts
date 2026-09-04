export type LinkStatus = 'pending' | 'active' | 'rejected' | 'revoked';

export type LinkRevokedBy = 'profissional' | 'paciente';

export type ProfessionalPatientLink = {
  id: string;
  professionalId: string;
  patientId: string | null;
  patientEmail: string;
  status: LinkStatus;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  revokedBy: LinkRevokedBy | null;
};

export type InvitePatientInput = {
  professionalId: string;
  patientEmail: string;
};

export type LinkedPatientSummary = {
  link: ProfessionalPatientLink;
  patient: {
    uid: string;
    name: string;
    email: string;
  };
};

const LINK_STATUSES: readonly LinkStatus[] = [
  'pending',
  'active',
  'rejected',
  'revoked',
] as const;

export function isLinkStatus(value: unknown): value is LinkStatus {
  return (
    typeof value === 'string' &&
    (LINK_STATUSES as readonly string[]).includes(value)
  );
}

export function normalizePatientEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Doc ID do vínculo ativo (usado nas security rules). */
export function buildActiveLinkId(
  professionalId: string,
  patientId: string,
): string {
  return `${professionalId}_${patientId}`;
}

/**
 * Doc ID do convite pendente (1 por profissional + e-mail).
 * Mantém o e-mail normalizado no ID para as security rules validarem o aceite.
 */
export function buildPendingLinkId(
  professionalId: string,
  patientEmail: string,
): string {
  return `pending_${professionalId}_${normalizePatientEmail(patientEmail)}`;
}
