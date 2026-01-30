export interface IComment {
  id: number;
  comment: string;
  authorType: 'client' | 'user';
  authorId: number;
  authorName: string;
  seenAt: Date;
  needsAttention: boolean;
  createdAt: string;
  createdAtTimestamp: number;
  positionId: number;
  setId: number;
}
