import { IPosition } from '../../../sets/positions-table/types/IPosition';
import { ISet } from '../../../sets/types/ISet';

export interface IValidSetForClient {
  valid: boolean;
  set: ISet;
  positions: IPosition[];
}
