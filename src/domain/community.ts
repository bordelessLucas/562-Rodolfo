export type CommunityStatus =
  | 'draft'
  | 'pending'
  | 'published'
  | 'rejected';

/** Quem pode publicar / comentar no grupo. */
export type CommunityAccessPolicy =
  | 'members'
  | 'owner'
  | 'professionals';

/** Como novos usuários entram no grupo. */
export type CommunityJoinPolicy = 'open' | 'approval';

export type MembershipStatus = 'pending' | 'active' | 'rejected';

export type CommunityTagId =
  | 'rotina'
  | 'movimento'
  | 'alimentacao'
  | 'apoio'
  | 'noticias'
  | 'profissionais';

export const COMMUNITY_TAG_OPTIONS: {
  id: CommunityTagId;
  label: string;
}[] = [
  { id: 'rotina', label: 'Rotina e cuidados' },
  { id: 'movimento', label: 'Movimento' },
  { id: 'alimentacao', label: 'Alimentação' },
  { id: 'apoio', label: 'Apoio emocional' },
  { id: 'noticias', label: 'Notícias e pesquisa' },
  { id: 'profissionais', label: 'Com profissionais' },
];

export type Community = {
  id: string;
  title: string;
  description: string;
  status: CommunityStatus;
  createdBy: string;
  createdByRole: 'admin' | 'profissional';
  createdByName: string;
  memberCount: number;
  coverUrl: string | null;
  tags: CommunityTagId[];
  postPolicy: CommunityAccessPolicy;
  commentPolicy: CommunityAccessPolicy;
  joinPolicy: CommunityJoinPolicy;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
};

export type CommunityMember = {
  id: string;
  communityId: string;
  userId: string;
  userName: string;
  status: MembershipStatus;
  joinedAt: Date;
  requestedAt: Date | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
};

export type CommunityPost = {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  title: string;
  summary: string;
  body: string;
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CommunityComment = {
  id: string;
  communityId: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  /** null = comentário raiz; string = resposta ao raiz. */
  parentCommentId: string | null;
  createdAt: Date;
};

export type CreateCommunityInput = {
  title: string;
  description: string;
  createdBy: string;
  createdByRole: 'admin' | 'profissional';
  createdByName: string;
  publishNow: boolean;
  coverUrl?: string | null;
  tags?: CommunityTagId[];
  postPolicy?: CommunityAccessPolicy;
  commentPolicy?: CommunityAccessPolicy;
  joinPolicy?: CommunityJoinPolicy;
};

export type CreateCommunityPostInput = {
  communityId: string;
  authorId: string;
  authorName: string;
  title: string;
  summary: string;
  body: string;
  imageUrl?: string | null;
};

export type CreateCommunityCommentInput = {
  communityId: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  parentCommentId?: string | null;
};

export function communityStatusLabel(status: CommunityStatus): string {
  switch (status) {
    case 'draft':
      return 'Rascunho';
    case 'pending':
      return 'Aguardando aprovação';
    case 'published':
      return 'Publicada';
    case 'rejected':
      return 'Recusada';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function communityPolicyLabel(policy: CommunityAccessPolicy): string {
  switch (policy) {
    case 'members':
      return 'Todos os membros';
    case 'owner':
      return 'Somente o dono do grupo';
    case 'professionals':
      return 'Somente profissionais de saúde';
    default: {
      const _exhaustive: never = policy;
      return _exhaustive;
    }
  }
}

export function communityJoinPolicyLabel(policy: CommunityJoinPolicy): string {
  switch (policy) {
    case 'open':
      return 'Entrada livre';
    case 'approval':
      return 'Precisa de aprovação do dono';
    default: {
      const _exhaustive: never = policy;
      return _exhaustive;
    }
  }
}

export function membershipStatusLabel(status: MembershipStatus): string {
  switch (status) {
    case 'pending':
      return 'Aguardando aprovação';
    case 'active':
      return 'Membro';
    case 'rejected':
      return 'Solicitação recusada';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function communityTagLabel(tag: CommunityTagId): string {
  return (
    COMMUNITY_TAG_OPTIONS.find((item) => item.id === tag)?.label ?? tag
  );
}

export function isCommunityTagId(value: string): value is CommunityTagId {
  return COMMUNITY_TAG_OPTIONS.some((item) => item.id === value);
}

export function isCommunityAccessPolicy(
  value: unknown,
): value is CommunityAccessPolicy {
  return (
    value === 'members' || value === 'owner' || value === 'professionals'
  );
}

export function isCommunityJoinPolicy(
  value: unknown,
): value is CommunityJoinPolicy {
  return value === 'open' || value === 'approval';
}

export function isMembershipStatus(value: unknown): value is MembershipStatus {
  return value === 'pending' || value === 'active' || value === 'rejected';
}

export function isActiveMembership(
  member: CommunityMember | null | undefined,
): boolean {
  return Boolean(member && member.status === 'active');
}

export function canUserAccessByPolicy(input: {
  policy: CommunityAccessPolicy;
  userId: string;
  userRole: 'paciente' | 'profissional' | 'admin' | null;
  ownerId: string;
}): boolean {
  if (input.userRole === 'admin') {
    return true;
  }
  if (input.userId === input.ownerId) {
    return true;
  }
  switch (input.policy) {
    case 'members':
      return true;
    case 'owner':
      return false;
    case 'professionals':
      return input.userRole === 'profissional';
    default: {
      const _exhaustive: never = input.policy;
      return _exhaustive;
    }
  }
}
