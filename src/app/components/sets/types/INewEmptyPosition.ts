import { IUser } from '../../../login/IUser';
import { IBookmark } from '../../bookmarks/IBookmark';
import { ISet } from './ISet';

export interface INewEmptyPosition {
  kolejnosc: number;
  setId: ISet;
  bookmarkId: IBookmark;
  createdBy: IUser;
  updatedBy: IUser;
}
