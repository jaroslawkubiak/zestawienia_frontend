import { IPosition } from '../../sets/types/IPosition';
import { ISet } from '../../sets/types/ISet';

export interface IComment {
  id: number;
  comment: string;
  authorType: 'client' | 'user';
  authorId: number;
  seenAt: Date;
  needsAttention: boolean;
  createdAt: string;
  createdAtTimestamp: number;
  positionId: IPosition;
  setId: ISet;
  authorName?: string;
  notificationSend?: boolean;
  avatar?: string;
}
