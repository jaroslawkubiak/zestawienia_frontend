import { IBookmark } from '../../bookmarks/IBookmark';
import { IStatus } from './SetStatus';

export interface ISetHeader {
  name: string;
  address: string;
  selectedStatus: string;
  selectedBookmarks: IBookmark[];
}
