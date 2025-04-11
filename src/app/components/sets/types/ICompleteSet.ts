import { ISupplier } from '../../suppliers/types/ISupplier';
import { IPosition } from './IPosition';
import { ISet } from './ISet';

export interface ICompleteSet {
  set: ISet;
  positions: IPosition[];
  suppliers: ISupplier[];
}
