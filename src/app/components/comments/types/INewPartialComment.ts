import { ISet } from '../../sets/types/ISet';
import { TAuthorType } from './authorType.type';

export interface INewPartialComment {
  comment: string;
  authorType: TAuthorType;
  positionId: number;
  setId: number;
  set: ISet;
}
