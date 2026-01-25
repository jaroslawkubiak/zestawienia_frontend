import { IPosition } from './IPosition';
import { ISet } from './ISet';

export interface IValidSetForClient {
  valid: boolean;
  set: ISet;
  positions: IPosition[];
}
