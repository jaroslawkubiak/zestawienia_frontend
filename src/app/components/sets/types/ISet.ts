import { IBookmark } from '../../bookmarks/IBookmark';
import { IComment } from '../../comments/types/IComment';
import { IFileList } from '../../files/types/IFileList';

export interface ISet {
  id: number;
  name: string;
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
  clientId: {
    id: number;
    firma: string;
    email: string;
  };
  createdBy: {
    name: string;
  };
  updatedBy: {
    name: string;
  };
}
