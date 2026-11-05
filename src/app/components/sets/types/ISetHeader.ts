import { IBookmarksWithTableColumns } from '../../bookmarks/types/IBookmarksWithTableColumns';
import { ISetVisibility } from './ISetVisibility';

export interface ISetHeader {
  name: string;
  address: string;
  selectedStatus: string;
  selectedBookmarks: IBookmarksWithTableColumns[];
  setVisibility: ISetVisibility;
}
