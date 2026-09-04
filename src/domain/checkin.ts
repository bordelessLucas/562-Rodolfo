/**
 * Opções padrão iniciais do Check-in (podem evoluir / vir do backend depois).
 */

export const TREATMENT_OPTIONS = [
  'Roupa de compressão',
  'Compressão pneumática',
  'Drenagem linfática',
  'Plataforma vibratória',
] as const;

export const ACTIVITY_OPTIONS = [
  'Dia de descanso',
  'Caminhada',
  'Corrida',
  'Treino de força',
] as const;

export const LIFESTYLE_OPTIONS = [
  'Hidratação adequada',
  'Alimentação equilibrada',
  'Redução de sódio',
  'Sono reparador',
] as const;

export const SUPPLEMENT_OPTIONS = [
  'Diosmina + Hesperidina',
  'Ômega-3',
  'Vitamina D',
  'Magnésio',
] as const;

export const MEDICATION_OPTIONS = [
  'Semaglutida',
  'Tirzepatida',
] as const;

export const MEDICATION_SAFETY_NOTICE =
  'Registro destinado apenas ao acompanhamento. Alterações em medicamentos ou suplementos devem ser orientadas por profissional de saúde.';

export type WellbeingScores = {
  pain: number | null;
  heaviness: number | null;
  energy: number | null;
  mood: number | null;
};

export type BodyMeasurements = {
  ankleLeft: number | null;
  ankleRight: number | null;
  calfLeft: number | null;
  calfRight: number | null;
  kneeLeft: number | null;
  kneeRight: number | null;
  thighLeft: number | null;
  thighRight: number | null;
  upperArmLeft: number | null;
  upperArmRight: number | null;
  weight: number | null;
};

export type DailyCheckin = {
  id: string;
  userId: string;
  date: string;
  treatments: string[];
  activities: string[];
  lifestyle: string[];
  supplements: string[];
  medications: string[];
  wellbeing: WellbeingScores;
  measurements: BodyMeasurements;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UpsertDailyCheckinInput = {
  userId: string;
  date: string;
  treatments: string[];
  activities: string[];
  lifestyle: string[];
  supplements: string[];
  medications: string[];
  wellbeing: WellbeingScores;
  measurements: BodyMeasurements;
  notes: string;
};

export function createEmptyWellbeing(): WellbeingScores {
  return {
    pain: null,
    heaviness: null,
    energy: null,
    mood: null,
  };
}

export function createEmptyMeasurements(): BodyMeasurements {
  return {
    ankleLeft: null,
    ankleRight: null,
    calfLeft: null,
    calfRight: null,
    kneeLeft: null,
    kneeRight: null,
    thighLeft: null,
    thighRight: null,
    upperArmLeft: null,
    upperArmRight: null,
    weight: null,
  };
}

export function buildCheckinId(userId: string, date: string): string {
  return `${userId}_${date}`;
}
