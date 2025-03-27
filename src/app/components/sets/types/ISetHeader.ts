import { IBookmark } from '../../bookmarks/IBookmark';
import { IStatus } from './SetStatus';

export interface ISetHeader {
  name: string;
  selectedStatus: string;
  selectedBookmarks: IBookmark[];
}
