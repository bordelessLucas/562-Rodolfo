import { useCallback, useEffect, useState } from 'react';

import type { DailyCheckin } from '@/src/domain/checkin';
import type { ProfessionalPatientLink } from '@/src/domain/professionalLink';
import type { UserProfile } from '@/src/domain/user';
import {
  getActiveLink,
  revokeLink,
} from '@/src/services/professionalLink.service';
import {
  getPatientProfileIfLinked,
  listPatientCheckinsIfLinked,
} from '@/src/services/professionalPatient.service';

export function useLinkedPatientDetail(
  professionalId: string | undefined,
  patientId: string | undefined,
) {
  const [patient, setPatient] = useState<UserProfile | null>(null);
  const [link, setLink] = useState<ProfessionalPatientLink | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!professionalId || !patientId) {
      setPatient(null);
      setLink(null);
      setCheckins([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [profile, activeLink, items] = await Promise.all([
        getPatientProfileIfLinked(professionalId, patientId),
        getActiveLink(professionalId, patientId),
        listPatientCheckinsIfLinked(professionalId, patientId),
      ]);

      if (!profile || !activeLink) {
        setPatient(null);
        setLink(null);
        setCheckins([]);
        setError('Não há vínculo ativo com este paciente.');
        return;
      }

      setPatient(profile);
      setLink(activeLink);
      setCheckins(items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os dados do paciente.',
      );
    } finally {
      setLoading(false);
    }
  }, [patientId, professionalId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const endLink = useCallback(async () => {
    if (!professionalId || !link) {
      return;
    }

    setActing(true);
    setError(null);
    setMessage(null);
    try {
      await revokeLink(link.id, professionalId, 'profissional');
      setMessage('Vínculo encerrado.');
      setPatient(null);
      setLink(null);
      setCheckins([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível encerrar o vínculo.',
      );
    } finally {
      setActing(false);
    }
  }, [link, professionalId]);

  return {
    patient,
    link,
    checkins,
    loading,
    acting,
    error,
    message,
    refresh,
    endLink,
  };
}
