import { IBookmark } from '../../bookmarks/IBookmark';
import { IStatus } from './status';

export interface ISetHeader {
  name: string;
  selectedStatus: string;
  selectedBookmarks: IBookmark[];
}
