import { IBookmark } from '../../bookmarks/IBookmark';

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
  files?: string[];
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
