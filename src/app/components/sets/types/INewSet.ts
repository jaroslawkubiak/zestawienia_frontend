import { IBookmark } from '../../bookmarks/IBookmark';

export interface INewSet {
  name: string;
  clientId: number;
  createdBy: number;
  bookmarks: IBookmark[];
  updatedAt?: string;
}
