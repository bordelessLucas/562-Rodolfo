import { useCallback, useEffect, useState } from 'react';

import type { ProfessionalPatientLink } from '@/src/domain/professionalLink';
import {
  acceptLink,
  listLinksForPatient,
  listPendingInvitesForPatient,
  rejectLink,
  revokeLink,
} from '@/src/services/professionalLink.service';

export type PatientLinkItem = {
  link: ProfessionalPatientLink;
  professionalName: string;
};

function toPatientLinkItem(link: ProfessionalPatientLink): PatientLinkItem {
  return {
    link,
    professionalName:
      link.professionalName?.trim() || 'Profissional de saúde',
  };
}

export function usePatientLinks(
  patientId: string | undefined,
  patientEmail: string | undefined,
) {
  const [pendingInvites, setPendingInvites] = useState<PatientLinkItem[]>([]);
  const [activeLinks, setActiveLinks] = useState<PatientLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [actingLinkId, setActingLinkId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!patientId || !patientEmail) {
      setPendingInvites([]);
      setActiveLinks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [pending, active] = await Promise.all([
        listPendingInvitesForPatient(patientEmail),
        listLinksForPatient(patientId, 'active'),
      ]);
      setPendingInvites(pending.map(toPatientLinkItem));
      setActiveLinks(active.map(toPatientLinkItem));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar seus vínculos.',
      );
    } finally {
      setLoading(false);
    }
  }, [patientEmail, patientId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const accept = useCallback(
    async (linkId: string) => {
      if (!patientId) {
        return;
      }
      setActing(true);
      setActingLinkId(linkId);
      setError(null);
      setMessage(null);
      try {
        await acceptLink(linkId, patientId);
        setMessage('Vínculo aceito. O profissional poderá ver seus check-ins.');
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível aceitar o convite.',
        );
      } finally {
        setActing(false);
        setActingLinkId(null);
      }
    },
    [patientId, refresh],
  );

  const reject = useCallback(
    async (linkId: string) => {
      if (!patientId) {
        return;
      }
      setActing(true);
      setActingLinkId(linkId);
      setError(null);
      setMessage(null);
      try {
        await rejectLink(linkId, patientId);
        setMessage('Convite recusado.');
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível recusar o convite.',
        );
      } finally {
        setActing(false);
        setActingLinkId(null);
      }
    },
    [patientId, refresh],
  );

  const revoke = useCallback(
    async (linkId: string) => {
      if (!patientId) {
        return;
      }
      setActing(true);
      setActingLinkId(linkId);
      setError(null);
      setMessage(null);
      try {
        await revokeLink(linkId, patientId, 'paciente');
        setMessage('Vínculo encerrado.');
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível encerrar o vínculo.',
        );
      } finally {
        setActing(false);
        setActingLinkId(null);
      }
    },
    [patientId, refresh],
  );

  return {
    pendingInvites,
    activeLinks,
    loading,
    acting,
    actingLinkId,
    error,
    message,
    refresh,
    accept,
    reject,
    revoke,
  };
}
