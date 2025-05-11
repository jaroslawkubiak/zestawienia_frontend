import { IUser } from '../../../login/types/IUser';
import { IBookmark } from '../../bookmarks/IBookmark';
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
  status: IPositionStatus | string;
  setId: ISet;
  supplierId: ISupplier;
  bookmarkId: IBookmark;
  createdBy?: IUser;
  updatedBy?: IUser;
}
