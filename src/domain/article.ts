export type ArticleKind = 'noticia' | 'pesquisa' | 'artigo';

export type ArticleStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected';

export type ContentArticle = {
  id: string;
  title: string;
  summary: string;
  body: string;
  kind: ArticleKind;
  status: ArticleStatus;
  coverUrl: string | null;
  externalUrl: string | null;
  createdBy: string;
  createdByRole: 'admin' | 'profissional';
  submittedAt: Date | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  publishedAt: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateArticleInput = {
  title: string;
  summary: string;
  body: string;
  kind: ArticleKind;
  coverUrl?: string | null;
  externalUrl?: string | null;
  sortOrder?: number;
  createdBy: string;
  createdByRole: 'admin' | 'profissional';
  status?: ArticleStatus;
};

const ARTICLE_KINDS: readonly ArticleKind[] = [
  'noticia',
  'pesquisa',
  'artigo',
] as const;

export function isArticleKind(value: unknown): value is ArticleKind {
  return (
    typeof value === 'string' &&
    (ARTICLE_KINDS as readonly string[]).includes(value)
  );
}

export function isArticleStatus(value: unknown): value is ArticleStatus {
  return (
    value === 'draft' ||
    value === 'pending_review' ||
    value === 'published' ||
    value === 'rejected'
  );
}

export function articleKindLabel(kind: ArticleKind): string {
  switch (kind) {
    case 'noticia':
      return 'Notícia';
    case 'pesquisa':
      return 'Pesquisa';
    case 'artigo':
      return 'Artigo';
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
