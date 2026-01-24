import { IBookmarksWithTableColumns } from '../../bookmarks/types/IBookmarksWithTableColumns';
import { IComment } from '../../comments/types/IComment';
import { IFileFullDetails } from '../../files/types/IFileFullDetails';

export interface ISet {
  id: number;
  name: string;
  address: string;
  status: string;
  createdAt: string;
  createdAtTimestamp: number;
  updatedAt: string;
  updatedAtTimestamp: number;
  hash: string;
  bookmarks: IBookmarksWithTableColumns[];
  lastBookmark: {
    id: number;
  };
  files?: IFileFullDetails[];
  comments?: IComment[];
  newComments?: number;
  fullName?: string;
  clientId: {
    id: number;
    lastName: string;
    firstName: string;
    email: string;
    company: string;
    hash: string;
  };
  createdBy: {
    name: string;
  };
  updatedBy: {
    name: string;
  };
}
