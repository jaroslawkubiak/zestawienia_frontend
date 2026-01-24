import { IUser } from '../../../login/types/IUser';
import { IBookmarksWithTableColumns } from '../../bookmarks/types/IBookmarksWithTableColumns';
import { ISet } from './ISet';

export interface INewEmptyPosition {
  kolejnosc: number;
  setId: ISet;
  bookmarkId: IBookmarksWithTableColumns;
  createdBy?: IUser;
  updatedBy?: IUser;
}
