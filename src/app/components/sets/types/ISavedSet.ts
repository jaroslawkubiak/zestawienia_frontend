import { IBookmarksWithTableColumns } from '../../bookmarks/types/IBookmarksWithTableColumns';

export interface ISavedSet {
  id: number;
  name: string;
  clientId: number;
  bookmarks: IBookmarksWithTableColumns[];
  hash: string;
  status: string;
  createdAt: string;
  createdAtTimestamp: number;
  updatedAt: string;
  updatedAtTimestamp: number;
}
