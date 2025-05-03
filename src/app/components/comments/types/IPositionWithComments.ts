import { IComment } from './IComment';

export interface IPositionWithComments {
  positionId: number;
  comments: IComment[];
}
