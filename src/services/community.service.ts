import {
  Timestamp,
  collection,
  collectionGroup,
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
  CommunityAccessPolicy,
  CommunityComment,
  CommunityJoinPolicy,
  CommunityMember,
  CommunityPost,
  CommunityStatus,
  CommunityTagId,
  CreateCommunityCommentInput,
  CreateCommunityInput,
  CreateCommunityPostInput,
  MembershipStatus,
} from '@/src/domain/community';
import {
  isActiveMembership,
  isCommunityAccessPolicy,
  isCommunityJoinPolicy,
  isCommunityTagId,
  isMembershipStatus,
} from '@/src/domain/community';
import { db } from '@/src/services/firebase';

const COMMUNITIES = 'communities';

const DEMO_COVER =
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80';
const DEMO_COVER_2 =
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80';
const DEMO_POST_IMAGE =
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80';

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

function mapTags(value: unknown): CommunityTagId[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (item): item is CommunityTagId =>
      typeof item === 'string' && isCommunityTagId(item),
  );
}

function mapPolicy(
  value: unknown,
  fallback: CommunityAccessPolicy = 'members',
): CommunityAccessPolicy {
  return isCommunityAccessPolicy(value) ? value : fallback;
}

function mapJoinPolicy(
  value: unknown,
  fallback: CommunityJoinPolicy = 'open',
): CommunityJoinPolicy {
  return isCommunityJoinPolicy(value) ? value : fallback;
}

function mapMembershipStatus(value: unknown): MembershipStatus {
  if (isMembershipStatus(value)) {
    return value;
  }
  // Docs antigos sem status = membro ativo.
  return 'active';
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
    coverUrl: typeof data.coverUrl === 'string' ? data.coverUrl : null,
    tags: mapTags(data.tags),
    postPolicy: mapPolicy(data.postPolicy),
    commentPolicy: mapPolicy(data.commentPolicy),
    joinPolicy: mapJoinPolicy(data.joinPolicy),
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
  const joinedAt =
    data.joinedAt instanceof Timestamp
      ? data.joinedAt.toDate()
      : new Date();
  return {
    id,
    communityId: data.communityId,
    userId: data.userId,
    userName: data.userName,
    status: mapMembershipStatus(data.status),
    joinedAt,
    requestedAt:
      data.requestedAt instanceof Timestamp
        ? data.requestedAt.toDate()
        : joinedAt,
    reviewedAt:
      data.reviewedAt instanceof Timestamp
        ? data.reviewedAt.toDate()
        : null,
    reviewedBy:
      typeof data.reviewedBy === 'string' ? data.reviewedBy : null,
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
  const title =
    typeof data.title === 'string' && data.title.trim()
      ? data.title
      : 'Publicação';
  const summary =
    typeof data.summary === 'string' && data.summary.trim()
      ? data.summary
      : data.body.slice(0, 140);
  return {
    id,
    communityId: data.communityId,
    authorId: data.authorId,
    authorName: data.authorName,
    title,
    summary,
    body: data.body,
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : null,
    likeCount: typeof data.likeCount === 'number' ? data.likeCount : 0,
    commentCount:
      typeof data.commentCount === 'number' ? data.commentCount : 0,
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
    parentCommentId:
      typeof data.parentCommentId === 'string'
        ? data.parentCommentId
        : null,
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
    coverUrl: input.coverUrl?.trim() || null,
    tags: input.tags ?? [],
    postPolicy: input.postPolicy ?? 'members',
    commentPolicy: input.commentPolicy ?? 'members',
    joinPolicy: input.joinPolicy ?? 'open',
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

export async function listCommunitiesByCreator(
  creatorId: string,
): Promise<Community[]> {
  return listMyCommunities(creatorId);
}

/** Comunidades em que o usuário é membro (collection group). */
export async function listJoinedCommunities(
  userId: string,
): Promise<Community[]> {
  try {
    const memberships = await getDocs(
      query(
        collectionGroup(db, 'members'),
        where('userId', '==', userId),
        orderBy('joinedAt', 'desc'),
      ),
    );

    const communities: Community[] = [];
    for (const membership of memberships.docs) {
      const mapped = mapMember(
        membership.id,
        membership.data() as Record<string, unknown>,
      );
      if (!isActiveMembership(mapped)) {
        continue;
      }
      const data = membership.data() as Record<string, unknown>;
      const communityId =
        typeof data.communityId === 'string'
          ? data.communityId
          : membership.ref.parent.parent?.id;
      if (!communityId) {
        continue;
      }
      const community = await getCommunityById(communityId);
      if (community && community.status === 'published') {
        communities.push(community);
      }
    }
    return communities;
  } catch {
    // Fallback enquanto o índice collection group sobe / falha pontual.
    const published = await listPublishedCommunities();
    const joined: Community[] = [];
    for (const community of published) {
      const membership = await getMembership(community.id, userId);
      if (isActiveMembership(membership)) {
        joined.push(community);
      }
    }
    return joined;
  }
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
}): Promise<'active' | 'pending'> {
  const community = await getCommunityById(input.communityId);
  if (!community || community.status !== 'published') {
    throw new Error('Comunidade indisponível.');
  }

  const memberRef = doc(
    db,
    COMMUNITIES,
    input.communityId,
    'members',
    input.userId,
  );
  const existing = await getDoc(memberRef);
  if (existing.exists()) {
    const mapped = mapMember(
      existing.id,
      existing.data() as Record<string, unknown>,
    );
    if (mapped?.status === 'active') {
      return 'active';
    }
    if (mapped?.status === 'pending') {
      return 'pending';
    }
    // rejected → remove e solicita de novo
    await deleteDoc(memberRef);
  }

  const requiresApproval = community.joinPolicy === 'approval';
  const status: MembershipStatus = requiresApproval ? 'pending' : 'active';
  const batch = writeBatch(db);
  batch.set(memberRef, {
    communityId: input.communityId,
    userId: input.userId,
    userName: input.userName.trim(),
    status,
    joinedAt: status === 'active' ? serverTimestamp() : null,
    requestedAt: serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
  });
  if (status === 'active') {
    batch.update(doc(db, COMMUNITIES, input.communityId), {
      memberCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
  return status;
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
  const mapped = mapMember(
    existing.id,
    existing.data() as Record<string, unknown>,
  );
  const wasActive = isActiveMembership(mapped);

  const batch = writeBatch(db);
  batch.delete(memberRef);
  if (wasActive) {
    batch.update(doc(db, COMMUNITIES, input.communityId), {
      memberCount: increment(-1),
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

export async function listPendingMembers(
  communityId: string,
): Promise<CommunityMember[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COMMUNITIES, communityId, 'members'),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc'),
    ),
  );
  const items: CommunityMember[] = [];
  snapshot.forEach((item) => {
    const mapped = mapMember(item.id, item.data() as Record<string, unknown>);
    if (mapped) {
      items.push(mapped);
    }
  });
  return items;
}

export async function approveMember(input: {
  communityId: string;
  memberId: string;
  reviewerId: string;
}): Promise<void> {
  const memberRef = doc(
    db,
    COMMUNITIES,
    input.communityId,
    'members',
    input.memberId,
  );
  const existing = await getDoc(memberRef);
  if (!existing.exists()) {
    throw new Error('Solicitação não encontrada.');
  }
  const mapped = mapMember(
    existing.id,
    existing.data() as Record<string, unknown>,
  );
  if (!mapped || mapped.status !== 'pending') {
    throw new Error('Esta solicitação não está pendente.');
  }

  const batch = writeBatch(db);
  batch.update(memberRef, {
    status: 'active',
    joinedAt: serverTimestamp(),
    reviewedAt: serverTimestamp(),
    reviewedBy: input.reviewerId,
  });
  batch.update(doc(db, COMMUNITIES, input.communityId), {
    memberCount: increment(1),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function rejectMember(input: {
  communityId: string;
  memberId: string;
  reviewerId: string;
}): Promise<void> {
  const memberRef = doc(
    db,
    COMMUNITIES,
    input.communityId,
    'members',
    input.memberId,
  );
  const existing = await getDoc(memberRef);
  if (!existing.exists()) {
    return;
  }
  await updateDoc(memberRef, {
    status: 'rejected',
    reviewedAt: serverTimestamp(),
    reviewedBy: input.reviewerId,
  });
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

export async function getCommunityPost(
  communityId: string,
  postId: string,
): Promise<CommunityPost | null> {
  const snapshot = await getDoc(
    doc(db, COMMUNITIES, communityId, 'posts', postId),
  );
  if (!snapshot.exists()) {
    return null;
  }
  return mapPost(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function createCommunityPost(
  input: CreateCommunityPostInput,
): Promise<CommunityPost> {
  const title = input.title.trim();
  const summary = input.summary.trim();
  const body = input.body.trim();
  if (!title || !summary || !body) {
    throw new Error('Informe título, resumo e conteúdo da publicação.');
  }

  const ref = doc(collection(db, COMMUNITIES, input.communityId, 'posts'));
  await setDoc(ref, {
    communityId: input.communityId,
    authorId: input.authorId,
    authorName: input.authorName.trim(),
    title,
    summary,
    body,
    imageUrl: input.imageUrl?.trim() || null,
    likeCount: 0,
    commentCount: 0,
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

export async function createPostComment(
  input: CreateCommunityCommentInput,
): Promise<void> {
  const body = input.body.trim();
  if (!body) {
    throw new Error('Escreva um comentário.');
  }

  const postRef = doc(
    db,
    COMMUNITIES,
    input.communityId,
    'posts',
    input.postId,
  );
  const commentRef = doc(collection(postRef, 'comments'));
  const batch = writeBatch(db);
  batch.set(commentRef, {
    communityId: input.communityId,
    postId: input.postId,
    authorId: input.authorId,
    authorName: input.authorName.trim(),
    body,
    parentCommentId: input.parentCommentId ?? null,
    createdAt: serverTimestamp(),
  });
  batch.update(postRef, {
    commentCount: increment(1),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function hasLikedPost(input: {
  communityId: string;
  postId: string;
  userId: string;
}): Promise<boolean> {
  const snapshot = await getDoc(
    doc(
      db,
      COMMUNITIES,
      input.communityId,
      'posts',
      input.postId,
      'likes',
      input.userId,
    ),
  );
  return snapshot.exists();
}

export async function togglePostLike(input: {
  communityId: string;
  postId: string;
  userId: string;
}): Promise<{ liked: boolean; likeCount: number }> {
  const likeRef = doc(
    db,
    COMMUNITIES,
    input.communityId,
    'posts',
    input.postId,
    'likes',
    input.userId,
  );
  const postRef = doc(
    db,
    COMMUNITIES,
    input.communityId,
    'posts',
    input.postId,
  );
  const existing = await getDoc(likeRef);
  const batch = writeBatch(db);

  if (existing.exists()) {
    batch.delete(likeRef);
    batch.update(postRef, {
      likeCount: increment(-1),
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    const post = await getCommunityPost(input.communityId, input.postId);
    return { liked: false, likeCount: post?.likeCount ?? 0 };
  }

  batch.set(likeRef, {
    userId: input.userId,
    createdAt: serverTimestamp(),
  });
  batch.update(postRef, {
    likeCount: increment(1),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  const post = await getCommunityPost(input.communityId, input.postId);
  return { liked: true, likeCount: post?.likeCount ?? 0 };
}

export async function deleteOwnPost(input: {
  communityId: string;
  postId: string;
}): Promise<void> {
  await deleteDoc(
    doc(db, COMMUNITIES, input.communityId, 'posts', input.postId),
  );
}

/** Seed demo enriquecido (capa, tags, políticas, posts). */
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
    coverUrl: string | null;
    tags: CommunityTagId[];
    postPolicy: CommunityAccessPolicy;
    commentPolicy: CommunityAccessPolicy;
    joinPolicy: CommunityJoinPolicy;
    seedPosts?: Array<{
      id: string;
      title: string;
      summary: string;
      body: string;
      imageUrl: string | null;
      threads?: Array<{
        id: string;
        authorName: string;
        body: string;
        replies?: Array<{
          id: string;
          authorName: string;
          body: string;
        }>;
      }>;
    }>;
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
      coverUrl: DEMO_COVER,
      tags: ['rotina', 'movimento'],
      postPolicy: 'members',
      commentPolicy: 'members',
      joinPolicy: 'open',
      seedPosts: [
        {
          id: 'post_rotina_manha',
          title: 'Minha rotina leve pela manhã',
          summary:
            'Como organizo compressão e uma caminhada curta sem exagerar.',
          body: 'Começo o dia com hidratação, vista a compressão com calma e faço uma caminhada de 15–20 minutos. Se a dor subir, eu pauso. Este espaço é para trocarmos o que funciona no dia a dia — sempre com orientação do seu profissional quando necessário.',
          imageUrl: DEMO_POST_IMAGE,
          threads: [
            {
              id: 'cmt_rotina_1',
              authorName: 'Ana (demo)',
              body: 'Gostei da ideia da caminhada curta. Também começo assim nos dias bons.',
              replies: [
                {
                  id: 'cmt_rotina_1r',
                  authorName: 'Marina (demo)',
                  body: 'Eu marco no celular um lembrete de pausa — ajuda bastante.',
                },
              ],
            },
            {
              id: 'cmt_rotina_2',
              authorName: 'Carla (demo)',
              body: 'Obrigada por compartilhar. Vou conversar com minha fisioterapeuta sobre o ritmo.',
            },
          ],
        },
        {
          id: 'post_compressao_noite',
          title: 'Compressão à noite: o que tem funcionado pra mim',
          summary: 'Relato pessoal sobre conforto e rotina noturna.',
          body: 'Tenho usado compressão mais leve à noite e priorizado elevação das pernas por 10 minutos. Não é regra para todo mundo — só um relato. Se sentirem desconforto, parem e falem com o profissional de referência.',
          imageUrl: null,
          threads: [
            {
              id: 'cmt_noite_1',
              authorName: 'Paula (demo)',
              body: 'Eu também evito dormir com peça muito justa. Valeu o aviso.',
              replies: [
                {
                  id: 'cmt_noite_1r',
                  authorName: 'Ana (demo)',
                  body: 'Mesmo aqui. Conforto primeiro.',
                },
              ],
            },
          ],
        },
      ],
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
      coverUrl: DEMO_COVER_2,
      tags: ['noticias'],
      postPolicy: 'professionals',
      commentPolicy: 'members',
      joinPolicy: 'approval',
      seedPosts: [
        {
          id: 'post_leitura_cuidados',
          title: 'Leitura sugerida sobre cuidados',
          summary:
            'Resumo educativo (não substitui consulta) para discutir no grupo.',
          body: 'Separamos pontos educativos gerais sobre acompanhamento e hábitos. Lembre-se: nada aqui substitui avaliação clínica individual. Use os comentários para dúvidas educacionais.',
          imageUrl: null,
          threads: [
            {
              id: 'cmt_leitura_1',
              authorName: 'Prof. Demo',
              body: 'Podem trazer dúvidas educacionais nos comentários. Evitem pedidos de conduta individual.',
              replies: [
                {
                  id: 'cmt_leitura_1r',
                  authorName: 'Joana (demo)',
                  body: 'Obrigada! Vou ler com calma e voltar com perguntas gerais.',
                },
              ],
            },
          ],
        },
      ],
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
      coverUrl: DEMO_COVER_2,
      tags: ['alimentacao'],
      postPolicy: 'members',
      commentPolicy: 'members',
      joinPolicy: 'approval',
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
      coverUrl: DEMO_COVER,
      tags: ['apoio'],
      postPolicy: 'members',
      commentPolicy: 'members',
      joinPolicy: 'open',
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
      coverUrl: null,
      tags: ['movimento'],
      postPolicy: 'owner',
      commentPolicy: 'owner',
      joinPolicy: 'approval',
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
      coverUrl: DEMO_COVER,
      tags: ['movimento', 'profissionais'],
      postPolicy: 'professionals',
      commentPolicy: 'members',
      joinPolicy: 'open',
      seedPosts: [
        {
          id: 'post_movimento_pausa',
          title: 'Pausas ativas no trabalho',
          summary: 'Ideias suaves de movimento para intercalares longas.',
          body: 'Levantar a cada hora, alongar panturrilha e caminhar até a cozinha já conta. Ajuste ao seu corpo e converse com seu profissional se tiver dúvidas.',
          imageUrl: DEMO_POST_IMAGE,
          threads: [
            {
              id: 'cmt_mov_1',
              authorName: 'Lia (demo)',
              body: 'As pausas de 2 minutos já mudaram meu dia. Obrigada!',
              replies: [
                {
                  id: 'cmt_mov_1r',
                  authorName: 'Profissional (demo)',
                  body: 'Que bom. Mantenha o ritmo confortável e sem dor.',
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const ensureSeedSocial = async (
    communityId: string,
    authorId: string,
    authorName: string,
    posts: NonNullable<(typeof demos)[number]['seedPosts']>,
  ) => {
    // Garante que o autor do seed é membro (likes/comentários exigem engajamento).
    const memberRef = doc(db, COMMUNITIES, communityId, 'members', authorId);
    if (!(await getDoc(memberRef)).exists()) {
      await setDoc(memberRef, {
        communityId,
        userId: authorId,
        userName: authorName,
        status: 'active',
        joinedAt: serverTimestamp(),
        requestedAt: serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null,
      });
      await updateDoc(doc(db, COMMUNITIES, communityId), {
        memberCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    }

    for (const post of posts) {
      const postRef = doc(db, COMMUNITIES, communityId, 'posts', post.id);
      const existingPost = await getDoc(postRef);

      if (!existingPost.exists()) {
        await setDoc(postRef, {
          communityId,
          authorId,
          authorName,
          title: post.title,
          summary: post.summary,
          body: post.body,
          imageUrl: post.imageUrl,
          likeCount: 0,
          commentCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(postRef, {
          title: post.title,
          summary: post.summary,
          body: post.body,
          imageUrl: post.imageUrl,
          updatedAt: serverTimestamp(),
        });
      }

      const likeRef = doc(postRef, 'likes', authorId);
      if (!(await getDoc(likeRef)).exists()) {
        const batch = writeBatch(db);
        batch.set(likeRef, {
          userId: authorId,
          createdAt: serverTimestamp(),
        });
        batch.update(postRef, {
          likeCount: increment(1),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
      }

      if (post.threads) {
        for (const thread of post.threads) {
          const commentRef = doc(postRef, 'comments', thread.id);
          if (!(await getDoc(commentRef)).exists()) {
            const batch = writeBatch(db);
            batch.set(commentRef, {
              communityId,
              postId: post.id,
              authorId,
              authorName: thread.authorName,
              body: thread.body,
              parentCommentId: null,
              createdAt: serverTimestamp(),
            });
            batch.update(postRef, {
              commentCount: increment(1),
              updatedAt: serverTimestamp(),
            });
            await batch.commit();
          }
          for (const reply of thread.replies ?? []) {
            const replyRef = doc(postRef, 'comments', reply.id);
            if (!(await getDoc(replyRef)).exists()) {
              const batch = writeBatch(db);
              batch.set(replyRef, {
                communityId,
                postId: post.id,
                authorId,
                authorName: reply.authorName,
                body: reply.body,
                parentCommentId: thread.id,
                createdAt: serverTimestamp(),
              });
              batch.update(postRef, {
                commentCount: increment(1),
                updatedAt: serverTimestamp(),
              });
              await batch.commit();
            }
          }
        }
      }
    }
  };

  let created = 0;
  let skipped = 0;
  let pendingCreated = 0;
  let pendingSkipped = 0;

  for (const demo of demos) {
    const ref = doc(db, COMMUNITIES, demo.id);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, {
        coverUrl: demo.coverUrl,
        tags: demo.tags,
        postPolicy: demo.postPolicy,
        commentPolicy: demo.commentPolicy,
        joinPolicy: demo.joinPolicy,
        updatedAt: serverTimestamp(),
      });
      if (demo.seedPosts && demo.status === 'published') {
        await ensureSeedSocial(
          demo.id,
          adminUid,
          demo.createdByName,
          demo.seedPosts,
        );
      }
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
      coverUrl: demo.coverUrl,
      tags: demo.tags,
      postPolicy: demo.postPolicy,
      commentPolicy: demo.commentPolicy,
      joinPolicy: demo.joinPolicy,
      rejectionReason: demo.rejectionReason,
      ...reviewed,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedAt:
        demo.status === 'published' ? serverTimestamp() : null,
    });

    if (demo.seedPosts && demo.status === 'published') {
      await ensureSeedSocial(
        demo.id,
        adminUid,
        demo.createdByName,
        demo.seedPosts,
      );
    }

    if (demo.countAsPending) {
      pendingCreated += 1;
    } else {
      created += 1;
    }
  }

  return { created, skipped, pendingCreated, pendingSkipped };
}
