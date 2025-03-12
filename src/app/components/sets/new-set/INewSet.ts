import { IBookmark } from '../../bookmarks/IBookmark';

export interface INewSet {
  numer: string;
  clientId: number;
  createdBy: number;
  bookmarks: IBookmark[];
}
