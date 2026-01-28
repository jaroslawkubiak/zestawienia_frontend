import { ISet } from '../../sets/types/ISet';

export interface INewPartialComment {
  comment: string;
  authorType: 'client' | 'user';
  positionId: number;
  setId: number;
  set: ISet;
}
