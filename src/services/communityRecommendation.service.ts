import type { DailyCheckin } from '@/src/domain/checkin';
import type { Community, CommunityTagId } from '@/src/domain/community';
import { isCommunityTagId } from '@/src/domain/community';

const CHECKIN_TO_TAGS: Record<string, CommunityTagId[]> = {
  compressao: ['rotina'],
  drenagem: ['rotina'],
  fisioterapia: ['movimento', 'rotina'],
  caminhada: ['movimento'],
  exercicio: ['movimento'],
  alimentacao: ['alimentacao'],
  nutricao: ['alimentacao'],
  meditacao: ['apoio'],
  sono: ['apoio', 'rotina'],
  apoio: ['apoio'],
};

function collectSignals(checkins: DailyCheckin[]): Set<CommunityTagId> {
  const signals = new Set<CommunityTagId>();
  for (const checkin of checkins) {
    const bags = [
      ...checkin.treatments,
      ...checkin.activities,
      ...checkin.lifestyle,
      ...checkin.supplements,
      ...checkin.medications,
    ];
    for (const raw of bags) {
      const key = raw
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      for (const [needle, tags] of Object.entries(CHECKIN_TO_TAGS)) {
        if (key.includes(needle)) {
          tags.forEach((tag) => signals.add(tag));
        }
      }
    }
  }
  return signals;
}

function scoreCommunity(
  community: Community,
  signals: Set<CommunityTagId>,
): number {
  let score = community.memberCount;
  if (community.createdByRole === 'profissional') {
    score += 8;
  }
  for (const tag of community.tags) {
    if (signals.has(tag)) {
      score += 20;
    }
  }
  if (community.tags.includes('profissionais')) {
    score += 4;
  }
  return score;
}

/**
 * Indicações quando o usuário ainda não participa de grupos.
 * Heurística: overlap com check-in + popularidade + grupos de profissionais.
 */
export function recommendCommunities(input: {
  published: Community[];
  excludeIds: Set<string>;
  recentCheckins: DailyCheckin[];
  maxItems?: number;
}): Community[] {
  const maxItems = input.maxItems ?? 6;
  const signals = collectSignals(input.recentCheckins);
  const candidates = input.published.filter(
    (item) => !input.excludeIds.has(item.id),
  );

  return [...candidates]
    .sort(
      (a, b) =>
        scoreCommunity(b, signals) - scoreCommunity(a, signals) ||
        (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
    )
    .slice(0, maxItems);
}

export function filterCommunities(input: {
  items: Community[];
  queryText: string;
  tag: CommunityTagId | 'todos';
}): Community[] {
  const q = input.queryText.trim().toLowerCase();
  return input.items.filter((item) => {
    if (input.tag !== 'todos') {
      if (!item.tags.includes(input.tag)) {
        return false;
      }
    }
    if (!q) {
      return true;
    }
    const tagText = item.tags.join(' ');
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      tagText.includes(q) ||
      item.createdByName.toLowerCase().includes(q)
    );
  });
}

export function parseHubTagFilter(
  value: string,
): CommunityTagId | 'todos' {
  if (value === 'todos') {
    return 'todos';
  }
  return isCommunityTagId(value) ? value : 'todos';
}
