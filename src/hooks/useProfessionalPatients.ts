import { useCallback, useEffect, useState } from 'react';

import type {
  LinkedPatientSummary,
  ProfessionalPatientLink,
} from '@/src/domain/professionalLink';
import {
  invitePatientByEmail,
  listLinksForProfessional,
  revokeLink,
} from '@/src/services/professionalLink.service';
import { listActivePatients } from '@/src/services/professionalPatient.service';

export function useProfessionalPatients(professionalId: string | undefined) {
  const [patients, setPatients] = useState<LinkedPatientSummary[]>([]);
  const [pendingInvites, setPendingInvites] = useState<ProfessionalPatientLink[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!professionalId) {
      setPatients([]);
      setPendingInvites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [active, pending] = await Promise.all([
        listActivePatients(professionalId),
        listLinksForProfessional(professionalId, 'pending'),
      ]);
      setPatients(active);
      setPendingInvites(pending);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar seus pacientes.',
      );
    } finally {
      setLoading(false);
    }
  }, [professionalId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const invite = useCallback(
    async (patientEmail: string) => {
      if (!professionalId) {
        return;
      }
      setActing(true);
      setError(null);
      setMessage(null);
      try {
        await invitePatientByEmail({ professionalId, patientEmail });
        setMessage('Convite enviado. O paciente verá o pedido ao entrar com este e-mail.');
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível enviar o convite.',
        );
      } finally {
        setActing(false);
      }
    },
    [professionalId, refresh],
  );

  const cancelInvite = useCallback(
    async (linkId: string) => {
      if (!professionalId) {
        return;
      }
      setActing(true);
      setError(null);
      setMessage(null);
      try {
        await revokeLink(linkId, professionalId, 'profissional');
        setMessage('Convite cancelado.');
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível cancelar o convite.',
        );
      } finally {
        setActing(false);
      }
    },
    [professionalId, refresh],
  );

  const endLink = useCallback(
    async (linkId: string) => {
      if (!professionalId) {
        return;
      }
      setActing(true);
      setError(null);
      setMessage(null);
      try {
        await revokeLink(linkId, professionalId, 'profissional');
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
      }
    },
    [professionalId, refresh],
  );

  return {
    patients,
    pendingInvites,
    loading,
    acting,
    error,
    message,
    refresh,
    invite,
    cancelInvite,
    endLink,
    clearFeedback: () => {
      setError(null);
      setMessage(null);
    },
  };
}
