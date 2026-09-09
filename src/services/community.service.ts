import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import type {
  Community,
  CommunityComment,
  CommunityMember,
  CommunityPost,
  CommunityStatus,
  CreateCommunityInput,
} from '@/src/domain/community';
import { db } from '@/src/services/firebase';

const COMMUNITIES = 'communities';

function asStatus(value: unknown): CommunityStatus | null {
  if (
    value === 'draft' ||
    value === 'pending' ||
    value === 'published' ||
    value === 'rejected'
  ) {
    return value;
  }
  return null;
}

function mapCommunity(
  id: string,
  data: Record<string, unknown>,
): Community | null {
  const status = asStatus(data.status);
  if (
    typeof data.title !== 'string' ||
    typeof data.description !== 'string' ||
    typeof data.createdBy !== 'string' ||
    status === null
  ) {
    return null;
  }

  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date();
  const updatedAt =
    data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate()
      : createdAt;
  const publishedAt =
    data.publishedAt instanceof Timestamp
      ? data.publishedAt.toDate()
      : null;
  const reviewedAt =
    data.reviewedAt instanceof Timestamp
      ? data.reviewedAt.toDate()
      : null;

  return {
    id,
    title: data.title,
    description: data.description,
    status,
    createdBy: data.createdBy,
    createdByRole:
      data.createdByRole === 'profissional' ? 'profissional' : 'admin',
    createdByName:
      typeof data.createdByName === 'string' ? data.createdByName : '',
    memberCount:
      typeof data.memberCount === 'number' ? data.memberCount : 0,
    createdAt,
    updatedAt,
    publishedAt,
    rejectionReason:
      typeof data.rejectionReason === 'string' ? data.rejectionReason : null,
    reviewedBy:
      typeof data.reviewedBy === 'string' ? data.reviewedBy : null,
    reviewedAt,
  };
}

function mapMember(
  id: string,
  data: Record<string, unknown>,
): CommunityMember | null {
  if (
    typeof data.communityId !== 'string' ||
    typeof data.userId !== 'string' ||
    typeof data.userName !== 'string'
  ) {
    return null;
  }
  return {
    id,
    communityId: data.communityId,
    userId: data.userId,
    userName: data.userName,
    joinedAt:
      data.joinedAt instanceof Timestamp
        ? data.joinedAt.toDate()
        : new Date(),
  };
}

function mapPost(
  id: string,
  data: Record<string, unknown>,
): CommunityPost | null {
  if (
    typeof data.communityId !== 'string' ||
    typeof data.authorId !== 'string' ||
    typeof data.authorName !== 'string' ||
    typeof data.body !== 'string'
  ) {
    return null;
  }
  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date();
  return {
    id,
    communityId: data.communityId,
    authorId: data.authorId,
    authorName: data.authorName,
    body: data.body,
    createdAt,
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : createdAt,
  };
}

function mapComment(
  id: string,
  data: Record<string, unknown>,
): CommunityComment | null {
  if (
    typeof data.communityId !== 'string' ||
    typeof data.postId !== 'string' ||
    typeof data.authorId !== 'string' ||
    typeof data.authorName !== 'string' ||
    typeof data.body !== 'string'
  ) {
    return null;
  }
  return {
    id,
    communityId: data.communityId,
    postId: data.postId,
    authorId: data.authorId,
    authorName: data.authorName,
    body: data.body,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(),
  };
}

export async function createCommunity(
  input: CreateCommunityInput,
): Promise<Community> {
  const ref = doc(collection(db, COMMUNITIES));
  const status: CommunityStatus = input.publishNow ? 'published' : 'pending';
  await setDoc(ref, {
    title: input.title.trim(),
    description: input.description.trim(),
    status,
    createdBy: input.createdBy,
    createdByRole: input.createdByRole,
    createdByName: input.createdByName.trim(),
    memberCount: 0,
    rejectionReason: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: input.publishNow ? serverTimestamp() : null,
  });

  const saved = await getCommunityById(ref.id);
  if (!saved) {
    throw new Error('Comunidade criada, mas não foi possível recarregar.');
  }
  return saved;
}

export async function getCommunityById(
  communityId: string,
): Promise<Community | null> {
  const snapshot = await getDoc(doc(db, COMMUNITIES, communityId));
  if (!snapshot.exists()) {
    return null;
  }
  return mapCommunity(
    snapshot.id,
    snapshot.data() as Record<string, unknown>,
  );
}

export async function listPublishedCommunities(): Promise<Community[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COMMUNITIES),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
    ),
  );
  const items: Community[] = [];
  snapshot.forEach((item) => {
    const mapped = mapCommunity(
      item.id,
      item.data() as Record<string, unknown>,
    );
    if (mapped) {
      items.push(mapped);
    }
  });
  return items;
}

export async function listPendingCommunities(): Promise<Community[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COMMUNITIES),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
    ),
  );
  const items: Community[] = [];
  snapshot.forEach((item) => {
    const mapped = mapCommunity(
      item.id,
      item.data() as Record<string, unknown>,
    );
    if (mapped) {
      items.push(mapped);
    }
  });
  return items;
}

export async function listMyCommunities(
  userId: string,
): Promise<Community[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COMMUNITIES),
      where('createdBy', '==', userId),
      orderBy('updatedAt', 'desc'),
    ),
  );
  const items: Community[] = [];
  snapshot.forEach((item) => {
    const mapped = mapCommunity(
      item.id,
      item.data() as Record<string, unknown>,
    );
    if (mapped) {
      items.push(mapped);
    }
  });
  return items;
}

/** Alias admin: todos os envios de um submetente. */
export async function listCommunitiesByCreator(
  creatorId: string,
): Promise<Community[]> {
  return listMyCommunities(creatorId);
}

export async function approveCommunity(
  communityId: string,
  adminUid: string,
): Promise<void> {
  await updateDoc(doc(db, COMMUNITIES, communityId), {
    status: 'published',
    rejectionReason: null,
    reviewedBy: adminUid,
    reviewedAt: serverTimestamp(),
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function rejectCommunity(
  communityId: string,
  adminUid: string,
  reason: string,
): Promise<void> {
  const trimmed = reason.trim();
  if (!trimmed) {
    throw new Error('Informe o motivo da recusa.');
  }
  await updateDoc(doc(db, COMMUNITIES, communityId), {
    status: 'rejected',
    rejectionReason: trimmed,
    reviewedBy: adminUid,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function joinCommunity(input: {
  communityId: string;
  userId: string;
  userName: string;
}): Promise<void> {
  const memberRef = doc(
    db,
    COMMUNITIES,
    input.communityId,
    'members',
    input.userId,
  );
  const existing = await getDoc(memberRef);
  if (existing.exists()) {
    return;
  }

  const batch = writeBatch(db);
  batch.set(memberRef, {
    communityId: input.communityId,
    userId: input.userId,
    userName: input.userName.trim(),
    joinedAt: serverTimestamp(),
  });
  batch.update(doc(db, COMMUNITIES, input.communityId), {
    memberCount: increment(1),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function leaveCommunity(input: {
  communityId: string;
  userId: string;
}): Promise<void> {
  const memberRef = doc(
    db,
    COMMUNITIES,
    input.communityId,
    'members',
    input.userId,
  );
  const existing = await getDoc(memberRef);
  if (!existing.exists()) {
    return;
  }

  const batch = writeBatch(db);
  batch.delete(memberRef);
  batch.update(doc(db, COMMUNITIES, input.communityId), {
    memberCount: increment(-1),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function getMembership(
  communityId: string,
  userId: string,
): Promise<CommunityMember | null> {
  const snapshot = await getDoc(
    doc(db, COMMUNITIES, communityId, 'members', userId),
  );
  if (!snapshot.exists()) {
    return null;
  }
  return mapMember(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function listCommunityPosts(
  communityId: string,
  maxItems = 40,
): Promise<CommunityPost[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COMMUNITIES, communityId, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(maxItems),
    ),
  );
  const items: CommunityPost[] = [];
  snapshot.forEach((item) => {
    const mapped = mapPost(item.id, item.data() as Record<string, unknown>);
    if (mapped) {
      items.push(mapped);
    }
  });
  return items;
}

export async function createCommunityPost(input: {
  communityId: string;
  authorId: string;
  authorName: string;
  body: string;
}): Promise<CommunityPost> {
  const ref = doc(collection(db, COMMUNITIES, input.communityId, 'posts'));
  await setDoc(ref, {
    communityId: input.communityId,
    authorId: input.authorId,
    authorName: input.authorName.trim(),
    body: input.body.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const snapshot = await getDoc(ref);
  const mapped = mapPost(
    snapshot.id,
    snapshot.data() as Record<string, unknown>,
  );
  if (!mapped) {
    throw new Error('Post criado, mas não foi possível recarregar.');
  }
  return mapped;
}

export async function listPostComments(
  communityId: string,
  postId: string,
): Promise<CommunityComment[]> {
  const snapshot = await getDocs(
    query(
      collection(
        db,
        COMMUNITIES,
        communityId,
        'posts',
        postId,
        'comments',
      ),
      orderBy('createdAt', 'asc'),
    ),
  );
  const items: CommunityComment[] = [];
  snapshot.forEach((item) => {
    const mapped = mapComment(
      item.id,
      item.data() as Record<string, unknown>,
    );
    if (mapped) {
      items.push(mapped);
    }
  });
  return items;
}

export async function createPostComment(input: {
  communityId: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
}): Promise<void> {
  const ref = doc(
    collection(
      db,
      COMMUNITIES,
      input.communityId,
      'posts',
      input.postId,
      'comments',
    ),
  );
  await setDoc(ref, {
    communityId: input.communityId,
    postId: input.postId,
    authorId: input.authorId,
    authorName: input.authorName.trim(),
    body: input.body.trim(),
    createdAt: serverTimestamp(),
  });
}

export async function deleteOwnPost(input: {
  communityId: string;
  postId: string;
}): Promise<void> {
  await deleteDoc(
    doc(db, COMMUNITIES, input.communityId, 'posts', input.postId),
  );
}

/** Seed demo: publicadas + fila + histórico misto do mesmo submetente. */
export async function seedDemoCommunities(
  adminUid: string,
  adminName: string,
): Promise<{
  created: number;
  skipped: number;
  pendingCreated: number;
  pendingSkipped: number;
}> {
  const demoSubmitterName = 'Profissional (demo)';

  const demos: Array<{
    id: string;
    title: string;
    description: string;
    status: 'published' | 'pending' | 'rejected';
    createdByRole: 'admin' | 'profissional';
    createdByName: string;
    rejectionReason: string | null;
    countAsPending: boolean;
  }> = [
    {
      id: 'demo_convivencia',
      title: 'Convivência e rotina',
      description:
        'Troca de experiências sobre compressão, movimento e cuidados do dia a dia.',
      status: 'published',
      createdByRole: 'admin',
      createdByName: adminName,
      rejectionReason: null,
      countAsPending: false,
    },
    {
      id: 'demo_novidades',
      title: 'Notícias e pesquisas',
      description:
        'Espaço para compartilhar leituras e dúvidas sobre conteúdos educativos.',
      status: 'published',
      createdByRole: 'admin',
      createdByName: adminName,
      rejectionReason: null,
      countAsPending: false,
    },
    {
      id: 'demo_pending_alimentacao',
      title: '[Demo] Alimentação e bem-estar',
      description:
        'Pedido de comunidade em demonstração. Aguardando aprovação do admin.',
      status: 'pending',
      createdByRole: 'profissional',
      createdByName: demoSubmitterName,
      rejectionReason: null,
      countAsPending: true,
    },
    {
      id: 'demo_pending_suporte',
      title: '[Demo] Rede de apoio emocional',
      description:
        'Submissão demo para a fila de comunidades. Toque no autor para ver o histórico.',
      status: 'pending',
      createdByRole: 'profissional',
      createdByName: demoSubmitterName,
      rejectionReason: null,
      countAsPending: true,
    },
    {
      id: 'demo_rejected_treino',
      title: '[Demo] Treinos intensos sem orientação',
      description:
        'Exemplo rejeitado para validar segurança e histórico do submetente.',
      status: 'rejected',
      createdByRole: 'profissional',
      createdByName: demoSubmitterName,
      rejectionReason:
        'Conteúdo inadequado: incentiva práticas sem acompanhamento profissional.',
      countAsPending: true,
    },
    {
      id: 'demo_accepted_movimento',
      title: '[Demo] Movimento seguro (aceito)',
      description:
        'Exemplo já aprovado do mesmo autor demo — aparece no histórico de envios.',
      status: 'published',
      createdByRole: 'profissional',
      createdByName: demoSubmitterName,
      rejectionReason: null,
      countAsPending: true,
    },
  ];

  let created = 0;
  let skipped = 0;
  let pendingCreated = 0;
  let pendingSkipped = 0;

  for (const demo of demos) {
    const ref = doc(db, COMMUNITIES, demo.id);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      if (demo.countAsPending) {
        pendingSkipped += 1;
      } else {
        skipped += 1;
      }
      continue;
    }

    const reviewed =
      demo.status === 'rejected' || demo.status === 'published'
        ? {
            reviewedBy: adminUid,
            reviewedAt: serverTimestamp(),
          }
        : {
            reviewedBy: null,
            reviewedAt: null,
          };

    await setDoc(ref, {
      title: demo.title,
      description: demo.description,
      status: demo.status,
      createdBy: adminUid,
      createdByRole: demo.createdByRole,
      createdByName: demo.createdByName,
      memberCount: 0,
      rejectionReason: demo.rejectionReason,
      ...reviewed,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedAt:
        demo.status === 'published' ? serverTimestamp() : null,
    });

    if (demo.countAsPending) {
      pendingCreated += 1;
    } else {
      created += 1;
    }
  }

  return { created, skipped, pendingCreated, pendingSkipped };
}
