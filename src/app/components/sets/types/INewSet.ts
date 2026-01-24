import { IBookmarksWithTableColumns } from '../../bookmarks/types/IBookmarksWithTableColumns';

export interface INewSet {
  name: string;
  address: string;
  clientId: number;
  createdBy: number;
  bookmarks: IBookmarksWithTableColumns[];
  updatedAt?: string;
}
