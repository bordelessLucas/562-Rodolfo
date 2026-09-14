/**
 * Padrão de mídia externa (sem Firebase Storage).
 * Ver docs-ia/padrao_midia_externa.md
 */

export type ExternalVideoProvider =
  | 'youtube'
  | 'vimeo'
  | 'external'
  | 'invalid'
  | 'empty';

export type ExternalVideoParseResult = {
  ok: boolean;
  /** URL trimada; null se vazia. */
  normalized: string | null;
  provider: ExternalVideoProvider;
  /** URL segura para abrir no browser/player. */
  watchUrl: string | null;
  youtubeId: string | null;
  thumbnailUrl: string | null;
  /** Rótulo curto para UI (ex.: "YouTube"). */
  providerLabel: string;
  /** CTA sugerido (ex.: "Assistir no YouTube"). */
  ctaLabel: string;
  error: string | null;
};

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
]);

const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);

function hostnameOf(url: URL): string {
  return url.hostname.toLowerCase();
}

function extractYoutubeId(url: URL): string | null {
  const host = hostnameOf(url);
  if (host === 'youtu.be' || host === 'www.youtu.be') {
    const id = url.pathname.replace(/^\//, '').split('/')[0];
    return id && id.length >= 6 ? id : null;
  }
  if (YOUTUBE_HOSTS.has(host)) {
    const v = url.searchParams.get('v');
    if (v && v.length >= 6) {
      return v;
    }
    const embed = url.pathname.match(/\/embed\/([^/?#]+)/);
    if (embed?.[1]) {
      return embed[1];
    }
    const shorts = url.pathname.match(/\/shorts\/([^/?#]+)/);
    if (shorts?.[1]) {
      return shorts[1];
    }
  }
  return null;
}

function providerLabels(provider: ExternalVideoProvider): {
  providerLabel: string;
  ctaLabel: string;
} {
  switch (provider) {
    case 'youtube':
      return {
        providerLabel: 'YouTube',
        ctaLabel: 'Assistir no YouTube',
      };
    case 'vimeo':
      return {
        providerLabel: 'Vimeo',
        ctaLabel: 'Assistir no Vimeo',
      };
    case 'external':
      return {
        providerLabel: 'Link externo',
        ctaLabel: 'Abrir vídeo externo',
      };
    case 'empty':
      return {
        providerLabel: 'Sem vídeo',
        ctaLabel: 'Abrir vídeo',
      };
    case 'invalid':
      return {
        providerLabel: 'URL inválida',
        ctaLabel: 'Abrir vídeo',
      };
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}

/**
 * Valida e classifica URL de vídeo externo (http/https).
 * Aceita YouTube, Vimeo e qualquer https genérico (mp4, landing, etc.).
 */
export function parseExternalVideoUrl(
  raw: string | null | undefined,
): ExternalVideoParseResult {
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  if (!trimmed) {
    const labels = providerLabels('empty');
    return {
      ok: false,
      normalized: null,
      provider: 'empty',
      watchUrl: null,
      youtubeId: null,
      thumbnailUrl: null,
      providerLabel: labels.providerLabel,
      ctaLabel: labels.ctaLabel,
      error: 'Informe a URL do vídeo (YouTube, Vimeo ou link https).',
    };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    const labels = providerLabels('invalid');
    return {
      ok: false,
      normalized: trimmed,
      provider: 'invalid',
      watchUrl: null,
      youtubeId: null,
      thumbnailUrl: null,
      providerLabel: labels.providerLabel,
      ctaLabel: labels.ctaLabel,
      error: 'URL inválida. Use um endereço completo começando com https://',
    };
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    const labels = providerLabels('invalid');
    return {
      ok: false,
      normalized: trimmed,
      provider: 'invalid',
      watchUrl: null,
      youtubeId: null,
      thumbnailUrl: null,
      providerLabel: labels.providerLabel,
      ctaLabel: labels.ctaLabel,
      error: 'A URL precisa usar http:// ou https://',
    };
  }

  const host = hostnameOf(url);
  const youtubeId = extractYoutubeId(url);
  let provider: ExternalVideoProvider = 'external';
  if (youtubeId || YOUTUBE_HOSTS.has(host)) {
    provider = 'youtube';
  } else if (VIMEO_HOSTS.has(host)) {
    provider = 'vimeo';
  }

  const labels = providerLabels(provider);
  const watchUrl = url.toString();
  const thumbnailUrl = youtubeId
    ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
    : null;

  return {
    ok: true,
    normalized: trimmed,
    provider,
    watchUrl,
    youtubeId: youtubeId && provider === 'youtube' ? youtubeId : null,
    thumbnailUrl,
    providerLabel: labels.providerLabel,
    ctaLabel: labels.ctaLabel,
    error: null,
  };
}

export function isValidExternalVideoUrl(
  raw: string | null | undefined,
): boolean {
  return parseExternalVideoUrl(raw).ok;
}

/**
 * Retorna URL normalizada ou lança Error com mensagem amigável.
 */
export function requireExternalVideoUrl(raw: string | null | undefined): string {
  const parsed = parseExternalVideoUrl(raw);
  if (!parsed.ok || !parsed.normalized) {
    throw new Error(
      parsed.error ?? 'Informe uma URL de vídeo externa válida.',
    );
  }
  return parsed.normalized;
}

export const EXTERNAL_VIDEO_FIELD_HINT =
  'Cole o link do YouTube, Vimeo ou outro vídeo https. Nesta fase não há upload para o Storage.';

export const EXTERNAL_VIDEO_PLACEHOLDER =
  'https://www.youtube.com/watch?v=…';
