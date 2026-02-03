import { IUser } from '../../../login/types/IUser';
import { IBookmarksWithTableColumns } from '../../bookmarks/types/IBookmarksWithTableColumns';
import { IPositionStatus } from '../positions-table/types/IPositionStatus';
import { ISet } from './ISet';

export interface INewEmptyPosition {
  kolejnosc: number;
  setId: ISet;
  status: IPositionStatus;
  bookmarkId: IBookmarksWithTableColumns;
  createdBy?: IUser;
  updatedBy?: IUser;
}
