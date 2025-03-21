import { IUser } from '../../../login/IUser';
import { IBookmark } from '../../bookmarks/IBookmark';
import { ISupplier } from '../../suppliers/ISupplier';
import { ISet } from './ISet';

export interface INewEmptyPosition {
  kolejnosc: number;
  setId: ISet;
  supplierId: ISupplier;
  bookmarkId: IBookmark;
  createdBy: IUser;
  updatedBy: IUser;
}
