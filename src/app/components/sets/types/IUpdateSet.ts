import { IPosition } from '../positions-table/types/IPosition';
import { ISet } from './ISet';

export interface IUpdateSet {
  set: Partial<ISet>;
  positions: Partial<IPosition[]>;
  userId?: number;
  positionToDelete?: number[];
}
