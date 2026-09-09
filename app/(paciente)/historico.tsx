import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';

/** Histórico unificado na aba Check-in. */
export default function HistoricoRedirect() {
  return <Redirect href={'/(paciente)/checkin' as Href} />;
}
