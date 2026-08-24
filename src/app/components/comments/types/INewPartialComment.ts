import { ISet } from '../../sets/types/ISet';
import { TAuthorType } from './authorType.type';

export interface INewPartialComment {
  comment: string;
  authorType: TAuthorType;
  positionId: number | null;
  fileId: number | null;
  setId: number;
  set: ISet;
}
