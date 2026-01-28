import { ISet } from '../../sets/types/ISet';

export interface IEditedPartialComment {
  commentId: number;
  comment: string;
  authorType: 'client' | 'user';
  set: ISet;
}
