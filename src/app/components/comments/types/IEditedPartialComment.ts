import { ISet } from '../../sets/types/ISet';
import { TAuthorType } from './authorType.type';

export interface IEditedPartialComment {
  commentId: number;
  comment: string;
  authorType: TAuthorType;
  set: ISet;
}
