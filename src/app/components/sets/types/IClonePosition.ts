import { IUser } from '../../../login/types/IUser';
import { IBookmarksWithTableColumns } from '../../bookmarks/types/IBookmarksWithTableColumns';
import { ISupplier } from '../../suppliers/ISupplier';
import { IPositionStatus } from './IPositionStatus';
import { ISet } from './ISet';

export interface IClonePosition {
  produkt: string;
  producent: string;
  kolekcja: string;
  nrKatalogowy: string;
  kolor: string;
  ilosc: number;
  netto: number;
  brutto: number;
  kolejnosc: number;
  pomieszczenie: string;
  link: string;
  uwagi: string;
  status: IPositionStatus | string;
  setId: ISet;
  supplierId: ISupplier;
  bookmarkId: IBookmarksWithTableColumns;
  createdBy?: IUser;
  updatedBy?: IUser;
}
