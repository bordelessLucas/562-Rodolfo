import { addDays, toDateKey } from '@/src/utils/navigation';

export type WeekDayStatus = {
  dateKey: string;
  label: string;
  done: boolean;
  isToday: boolean;
};

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

/** Semana corrente (segunda → domingo) com labels curtos. */
export function getCurrentWeekDays(reference = new Date()): Omit<
  WeekDayStatus,
  'done'
>[] {
  const todayKey = toDateKey(reference);
  const day = reference.getDay(); // 0 = domingo
  // Segunda = início: domingo → -6, segunda → 0, … sábado → -5
  const daysFromMonday = day === 0 ? 6 : day - 1;
  const start = new Date(reference);
  start.setDate(reference.getDate() - daysFromMonday);
  start.setHours(12, 0, 0, 0);

  const startKey = toDateKey(start);
  return WEEKDAY_LABELS.map((label, index) => {
    const dateKey = addDays(startKey, index);
    return {
      dateKey,
      label,
      isToday: dateKey === todayKey,
    };
  });
}
