import { IBookmarksWithTableColumns } from '../../bookmarks/types/IBookmarksWithTableColumns';

export interface ISetHeader {
  name: string;
  address: string;
  selectedStatus: string;
  selectedBookmarks: IBookmarksWithTableColumns[];
}
