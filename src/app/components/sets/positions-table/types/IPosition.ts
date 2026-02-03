import { IUser } from '../../../../login/types/IUser';
import { IBookmarksWithTableColumns } from '../../../bookmarks/types/IBookmarksWithTableColumns';
import { IUnreadComments } from '../../../comments/types/IUnreadComments';
import { ISupplier } from '../../../suppliers/types/ISupplier';
import { ISet } from '../../types/ISet';
import { IPositionStatus } from './IPositionStatus';

export interface IPosition {
  id: number;
  produkt: string;
  producent: string;
  kolekcja: string;
  nrKatalogowy: string;
  kolor: string;
  ilosc: number;
  netto: number;
  brutto: number;
  wartoscNetto?: number;
  wartoscBrutto?: number;
  kolejnosc: number;
  pomieszczenie: string;
  link: string;
  uwagi: string;
  image: string;
  status: IPositionStatus;
  createdAt: string;
  createdAtTimestamp: number;
  updatedAt: string;
  updatedAtTimestamp: number;
  setId: ISet;
  supplierId: ISupplier;
  bookmarkId: IBookmarksWithTableColumns;
  createdBy: IUser;
  updatedBy: IUser;
  [key: string]: any;
  newCommentsCount: IUnreadComments;
}
