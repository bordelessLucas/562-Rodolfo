import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { ProfessionalPatientDetailScreen } from '@/src/screens/ProfessionalPatientDetailScreen';

export default function PacienteDetailRoute() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const id = typeof patientId === 'string' ? patientId : '';

  return <ProfessionalPatientDetailScreen patientId={id} />;
}
