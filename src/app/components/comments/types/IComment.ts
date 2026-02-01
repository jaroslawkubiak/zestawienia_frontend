import { TAuthorType } from "./authorType.type";

export interface IComment {
  id: number;
  comment: string;
  authorType: TAuthorType;
  authorId: number;
  authorName: string;
  seenAt: Date;
  needsAttention: boolean;
  createdAt: string;
  createdAtTimestamp: number;
  positionId: number;
  setId: number;
}
