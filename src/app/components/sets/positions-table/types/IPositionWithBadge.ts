import { ICommentsBadge } from '../../../comments/types/ICommentBadge';
import { IPosition } from './IPosition';

export interface IPositionWithBadge extends IPosition {
  commentsBadge: ICommentsBadge;
}
