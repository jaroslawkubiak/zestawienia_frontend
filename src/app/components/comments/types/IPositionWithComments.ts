import { IPosition } from '../../sets/positions-table/types/IPosition';
import { IComment } from './IComment';

export interface IPositionWithComments {
  position: IPosition;
  comments: IComment[];
}
