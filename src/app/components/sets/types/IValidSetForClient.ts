import { IPosition } from '../positions-table/types/IPosition';
import { ISet } from './ISet';

export interface IValidSetForClient {
  valid: boolean;
  set: ISet;
  positions: IPosition[];
}
