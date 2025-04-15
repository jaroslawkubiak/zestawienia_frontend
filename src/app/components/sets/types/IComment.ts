import { IPosition } from './IPosition';
import { ISet } from './ISet';

export interface IComment {
  id: number;
  comment: string;
  authorType: 'client' | 'user';
  authorId: number;
  readByReceiver: boolean;
  createdAt: string;
  createdAtTimestamp: number;
  positionId: IPosition;
  setId: ISet;
}
