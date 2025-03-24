import { IBookmark } from "../../bookmarks/IBookmark";

export interface ISavedSet {
  id: number;
  name: string;
  clientId: number;
  bookmarks: IBookmark[];
  hash: string;
  status: string;
  createdAt: string;
  createdAtTimestamp: number;
  updatedAt: string;
  updatedAtTimestamp: number;
}
