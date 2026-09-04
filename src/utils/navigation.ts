import type { UserRole } from '@/src/domain/user';
import type { Href } from 'expo-router';

export function getHomeHrefForRole(role: UserRole | null | undefined): Href {
  if (role === 'profissional') {
    return '/(profissional)' as Href;
  }

  return '/(paciente)/checkin' as Href;
}

/** Formata Date local como YYYY-MM-DD */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(dateKey: string, amount: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

export function formatDateLabel(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function isToday(dateKey: string): boolean {
  return dateKey === toDateKey(new Date());
}

export function isFutureDate(dateKey: string): boolean {
  return dateKey > toDateKey(new Date());
}
