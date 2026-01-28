import { ISupplier } from '../../suppliers/ISupplier';
import { IPosition } from '../positions-table/types/IPosition';
import { ISet } from './ISet';

export interface ICompleteSet {
  set: ISet;
  positions: IPosition[];
  suppliers: ISupplier[];
}
