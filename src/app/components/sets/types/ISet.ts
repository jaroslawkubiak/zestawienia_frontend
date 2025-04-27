import { IBookmark } from '../../bookmarks/IBookmark';
import { IComment } from '../../comments/types/IComment';
import { IFileList } from '../../files/types/IFileList';

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
  bookmarks: IBookmark[];
  files?: IFileList;
  comments?: IComment[];
  newComments?: number;
  hasFiles?: boolean;
  fullName?: string;
  clientId: {
    id: number;
    lastName: string;
    firstName: string;
    email: string;
    company: string;
  };
  createdBy: {
    name: string;
  };
  updatedBy: {
    name: string;
  };
}
