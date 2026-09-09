export type CommunityStatus =
  | 'draft'
  | 'pending'
  | 'published'
  | 'rejected';

export type Community = {
  id: string;
  title: string;
  description: string;
  status: CommunityStatus;
  createdBy: string;
  createdByRole: 'admin' | 'profissional';
  createdByName: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  rejectionReason: string | null;
  /** UID do admin que aprovou/recusou (auditoria). */
  reviewedBy: string | null;
  reviewedAt: Date | null;
};

export type CommunityMember = {
  id: string;
  communityId: string;
  userId: string;
  userName: string;
  joinedAt: Date;
};

export type CommunityPost = {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  body: string;
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
  createdAt: Date;
};

export type CreateCommunityInput = {
  title: string;
  description: string;
  createdBy: string;
  createdByRole: 'admin' | 'profissional';
  createdByName: string;
  /** Admin publica direto; profissional cria como pending. */
  publishNow: boolean;
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
