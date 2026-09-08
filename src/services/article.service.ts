import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import {
  type ArticleKind,
  type ArticleStatus,
  type ContentArticle,
  type CreateArticleInput,
  isArticleKind,
  isArticleStatus,
} from '@/src/domain/article';
import { MOCK_PUBLISHED_ARTICLES } from '@/src/data/mockArticles';
import { isCoursesDemoMode } from '@/src/config/coursesDemo';
import { db } from '@/src/services/firebase';

const COLLECTION = 'contentArticles';

function asDate(value: unknown, fallback: Date): Date {
  return value instanceof Timestamp ? value.toDate() : fallback;
}

function asNullableDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

function mapArticle(
  id: string,
  data: Record<string, unknown>,
): ContentArticle | null {
  if (
    typeof data.title !== 'string' ||
    typeof data.summary !== 'string' ||
    typeof data.body !== 'string' ||
    !isArticleKind(data.kind) ||
    !isArticleStatus(data.status) ||
    typeof data.createdBy !== 'string' ||
    (data.createdByRole !== 'admin' && data.createdByRole !== 'profissional') ||
    typeof data.sortOrder !== 'number'
  ) {
    return null;
  }

  const createdAt = asDate(data.createdAt, new Date());
  return {
    id,
    title: data.title,
    summary: data.summary,
    body: data.body,
    kind: data.kind,
    status: data.status,
    coverUrl: typeof data.coverUrl === 'string' ? data.coverUrl : null,
    externalUrl: typeof data.externalUrl === 'string' ? data.externalUrl : null,
    createdBy: data.createdBy,
    createdByRole: data.createdByRole,
    submittedAt: asNullableDate(data.submittedAt),
    reviewedAt: asNullableDate(data.reviewedAt),
    reviewedBy: typeof data.reviewedBy === 'string' ? data.reviewedBy : null,
    rejectionReason:
      typeof data.rejectionReason === 'string' ? data.rejectionReason : null,
    publishedAt: asNullableDate(data.publishedAt),
    sortOrder: data.sortOrder,
    createdAt,
    updatedAt: asDate(data.updatedAt, createdAt),
  };
}

function articleFromSeed(
  seed: (typeof MOCK_PUBLISHED_ARTICLES)[number],
): ContentArticle {
  const now = new Date();
  return {
    id: seed.id,
    title: seed.input.title,
    summary: seed.input.summary,
    body: seed.input.body,
    kind: seed.input.kind,
    status: 'published',
    coverUrl: seed.input.coverUrl ?? null,
    externalUrl: seed.input.externalUrl ?? null,
    createdBy: 'demo',
    createdByRole: 'admin',
    submittedAt: null,
    reviewedAt: now,
    reviewedBy: 'demo',
    rejectionReason: null,
    publishedAt: now,
    sortOrder: seed.input.sortOrder ?? 0,
    createdAt: now,
    updatedAt: now,
  };
}

export type ListPublishedArticlesResult = {
  articles: ContentArticle[];
  usedDemoFallback: boolean;
  demoReason?: 'empty' | 'error';
};

export async function listPublishedArticles(): Promise<ListPublishedArticlesResult> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTION),
        where('status', '==', 'published'),
        orderBy('sortOrder', 'asc'),
      ),
    );

    const items: ContentArticle[] = [];
    snapshot.forEach((item) => {
      const mapped = mapArticle(item.id, item.data() as Record<string, unknown>);
      if (mapped) {
        items.push(mapped);
      }
    });

    if (items.length === 0 && isCoursesDemoMode()) {
      return {
        articles: MOCK_PUBLISHED_ARTICLES.map(articleFromSeed),
        usedDemoFallback: true,
        demoReason: 'empty',
      };
    }

    return { articles: items, usedDemoFallback: false };
  } catch (err) {
    if (isCoursesDemoMode()) {
      return {
        articles: MOCK_PUBLISHED_ARTICLES.map(articleFromSeed),
        usedDemoFallback: true,
        demoReason: 'error',
      };
    }
    throw err;
  }
}

export async function getArticleById(
  articleId: string,
): Promise<ContentArticle | null> {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION, articleId));
    if (!snapshot.exists()) {
      if (isCoursesDemoMode()) {
        const seed = MOCK_PUBLISHED_ARTICLES.find((item) => item.id === articleId);
        return seed ? articleFromSeed(seed) : null;
      }
      return null;
    }
    return mapArticle(snapshot.id, snapshot.data() as Record<string, unknown>);
  } catch (err) {
    if (isCoursesDemoMode()) {
      const seed = MOCK_PUBLISHED_ARTICLES.find((item) => item.id === articleId);
      if (seed) {
        return articleFromSeed(seed);
      }
    }
    throw err;
  }
}

export async function createArticle(
  input: CreateArticleInput,
  articleId?: string,
): Promise<ContentArticle> {
  const title = input.title.trim();
  if (!title) {
    throw new Error('Informe o título.');
  }

  const status: ArticleStatus =
    input.createdByRole === 'admin'
      ? (input.status ?? 'draft')
      : 'draft';

  const ref = articleId
    ? doc(db, COLLECTION, articleId)
    : doc(collection(db, COLLECTION));

  await setDoc(ref, {
    title,
    summary: input.summary.trim(),
    body: input.body.trim(),
    kind: input.kind,
    status,
    coverUrl: input.coverUrl?.trim() || null,
    externalUrl: input.externalUrl?.trim() || null,
    createdBy: input.createdBy,
    createdByRole: input.createdByRole,
    submittedAt: null,
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
    publishedAt: status === 'published' ? serverTimestamp() : null,
    sortOrder: input.sortOrder ?? 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const saved = await getArticleById(ref.id);
  if (!saved) {
    throw new Error('Não foi possível carregar o conteúdo criado.');
  }
  return saved;
}

export async function submitArticleForReview(
  articleId: string,
): Promise<ContentArticle> {
  await updateDoc(doc(db, COLLECTION, articleId), {
    status: 'pending_review',
    submittedAt: serverTimestamp(),
    rejectionReason: null,
    updatedAt: serverTimestamp(),
  });
  const saved = await getArticleById(articleId);
  if (!saved) {
    throw new Error('Não foi possível carregar o conteúdo enviado.');
  }
  return saved;
}

export async function approveArticle(
  articleId: string,
  adminId: string,
): Promise<ContentArticle> {
  await updateDoc(doc(db, COLLECTION, articleId), {
    status: 'published',
    reviewedAt: serverTimestamp(),
    reviewedBy: adminId,
    rejectionReason: null,
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const saved = await getArticleById(articleId);
  if (!saved) {
    throw new Error('Não foi possível carregar o conteúdo aprovado.');
  }
  return saved;
}

export async function listPendingArticles(): Promise<ContentArticle[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION),
      where('status', '==', 'pending_review'),
      orderBy('submittedAt', 'desc'),
    ),
  );
  const items: ContentArticle[] = [];
  snapshot.forEach((item) => {
    const mapped = mapArticle(item.id, item.data() as Record<string, unknown>);
    if (mapped) {
      items.push(mapped);
    }
  });
  return items;
}

export async function seedPublishedMockArticles(
  adminUid: string,
): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  for (const seed of MOCK_PUBLISHED_ARTICLES) {
    const existing = await getDoc(doc(db, COLLECTION, seed.id));
    if (existing.exists()) {
      skipped += 1;
      continue;
    }
    await createArticle(
      {
        ...seed.input,
        createdBy: adminUid,
        createdByRole: 'admin',
        status: 'published',
      },
      seed.id,
    );
    created += 1;
  }

  return { created, skipped };
}

export type ExploreFilterKind =
  | 'todos'
  | 'curso'
  | 'mentoria'
  | ArticleKind;

export function matchesSearch(title: string, queryText: string): boolean {
  const q = queryText.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return title.toLowerCase().includes(q);
}
