import type { DailyCheckin, WellbeingScores } from '@/src/domain/checkin';

/**
 * Indicador orientativo do check-in do dia.
 * NÃO é diagnóstico clínico nem substitui avaliação profissional.
 */
export type CheckinInsightLevel =
  | 'sem_dados'
  | 'ok'
  | 'comum'
  | 'anormal'
  | 'risco'
  | 'muito_risco';

export type CheckinInsight = {
  level: CheckinInsightLevel;
  label: string;
  summary: string;
  /** 0–100 para barra visual */
  score: number;
  factors: string[];
};

export function checkinInsightLabel(level: CheckinInsightLevel): string {
  switch (level) {
    case 'sem_dados':
      return 'Sem dados';
    case 'ok':
      return 'Ok';
    case 'comum':
      return 'Comum';
    case 'anormal':
      return 'Atenção';
    case 'risco':
      return 'Risco';
    case 'muito_risco':
      return 'Muito risco';
    default: {
      const _exhaustive: never = level;
      return _exhaustive;
    }
  }
}

function avgFilled(values: Array<number | null>): number | null {
  const filled = values.filter(
    (value): value is number => typeof value === 'number',
  );
  if (filled.length === 0) {
    return null;
  }
  return filled.reduce((sum, value) => sum + value, 0) / filled.length;
}

/**
 * Heurística simples sobre bem-estar do dia (dor/peso altos e energia/humor baixos).
 * Evolui depois com tendências/IA — mantém disclaimer não clínico.
 */
export function assessDailyCheckin(
  checkin: DailyCheckin | null,
): CheckinInsight {
  if (!checkin) {
    return {
      level: 'sem_dados',
      label: checkinInsightLabel('sem_dados'),
      summary:
        'Faça o check-in de hoje para ver um indicador orientativo do seu dia.',
      score: 0,
      factors: [],
    };
  }

  const { wellbeing } = checkin;
  const factors: string[] = [];
  let load = 0;

  const pushPainLike = (
    label: string,
    value: number | null,
    weight: number,
  ) => {
    if (value === null) {
      return;
    }
    if (value >= 8) {
      load += weight * 1;
      factors.push(`${label} alta (${value}/10)`);
    } else if (value >= 6) {
      load += weight * 0.65;
      factors.push(`${label} elevada (${value}/10)`);
    } else if (value >= 4) {
      load += weight * 0.3;
    }
  };

  const pushLowWellbeing = (
    label: string,
    value: number | null,
    weight: number,
  ) => {
    if (value === null) {
      return;
    }
    if (value <= 2) {
      load += weight * 1;
      factors.push(`${label} muito baixa (${value}/10)`);
    } else if (value <= 4) {
      load += weight * 0.55;
      factors.push(`${label} baixa (${value}/10)`);
    }
  };

  pushPainLike('Dor', wellbeing.pain, 1.2);
  pushPainLike('Sensação de peso', wellbeing.heaviness, 1);
  pushLowWellbeing('Energia', wellbeing.energy, 0.85);
  pushLowWellbeing('Humor', wellbeing.mood, 0.85);

  const filledCount = [
    wellbeing.pain,
    wellbeing.heaviness,
    wellbeing.energy,
    wellbeing.mood,
  ].filter((value) => value !== null).length;

  if (filledCount === 0) {
    return {
      level: 'comum',
      label: checkinInsightLabel('comum'),
      summary:
        'Check-in registrado, mas sem notas de bem-estar. Preencha dor/energia para um indicador mais útil.',
      score: 35,
      factors: ['Bem-estar não preenchido'],
    };
  }

  const discomfortAvg = avgFilled([wellbeing.pain, wellbeing.heaviness]);
  if (discomfortAvg !== null && discomfortAvg <= 3) {
    load = Math.max(0, load - 0.35);
  }

  let level: CheckinInsightLevel;
  if (load >= 2.4) {
    level = 'muito_risco';
  } else if (load >= 1.6) {
    level = 'risco';
  } else if (load >= 0.9) {
    level = 'anormal';
  } else if (load >= 0.35) {
    level = 'comum';
  } else {
    level = 'ok';
  }

  const score = Math.max(5, Math.min(100, Math.round(100 - load * 28)));

  return {
    level,
    label: checkinInsightLabel(level),
    summary: summaryForLevel(level, wellbeing),
    score,
    factors: factors.slice(0, 4),
  };
}

function summaryForLevel(
  level: CheckinInsightLevel,
  wellbeing: WellbeingScores,
): string {
  switch (level) {
    case 'ok':
      return 'Seu registro de hoje sugere um dia estável. Continue observando a rotina e os cuidados.';
    case 'comum':
      return 'Há sinais leves no bem-estar. Vale acompanhar nos próximos dias e manter seus cuidados habituais.';
    case 'anormal':
      return 'O check-in mostra desconforto acima do usual. Observe a evolução e converse com seu profissional se persistir.';
    case 'risco':
      return 'Há indícios de sobrecarga no dia (dor/peso ou energia baixa). Priorize descanso e orientação profissional se necessário.';
    case 'muito_risco':
      return 'O registro aponta desconforto intenso. Este app não faz diagnóstico — busque orientação do seu profissional de saúde.';
    default:
      return 'Indicador orientativo com base no check-in de hoje.';
  }
}

export function insightToneColor(
  level: CheckinInsightLevel,
): 'success' | 'secondary' | 'warning' | 'error' | 'muted' {
  switch (level) {
    case 'ok':
      return 'success';
    case 'comum':
      return 'secondary';
    case 'anormal':
      return 'warning';
    case 'risco':
    case 'muito_risco':
      return 'error';
    default:
      return 'muted';
  }
}
