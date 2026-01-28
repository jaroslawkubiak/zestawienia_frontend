import { IBookmarksWithTableColumns } from '../../bookmarks/types/IBookmarksWithTableColumns';
import { IComment } from '../../comments/types/IComment';
import { IUnreadComments } from '../../comments/types/IUnreadComments';
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
  newCommentsCount: IUnreadComments;
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
    id: number;
    name: string;
  };
  updatedBy: {
    id: number;
    name: string;
  };
}
