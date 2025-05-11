import { IBookmark } from '../../bookmarks/IBookmark';

export interface ISetHeader {
  name: string;
  address: string;
  selectedStatus: string;
  selectedBookmarks: IBookmark[];
}
