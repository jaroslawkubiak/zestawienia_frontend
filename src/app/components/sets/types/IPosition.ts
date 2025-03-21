import { IUser } from '../../../login/IUser';
import { IBookmark } from '../../bookmarks/IBookmark';
import { ISupplier } from '../../suppliers/ISupplier';
import { ISet } from './ISet';

export interface IPosition {
  id: number;
  produkt: string;
  producent: string;
  kolekcja: string;
  nrKatalogowy: string;
  kolor: string;
  ilosc: number;
  netto: number;
  brutto?: number;
  wartoscNetto?: number;
  wartoscBrutto?: number;
  kolejnosc: number;
  pomieszczenie: string;
  link: string;
  image: string;
  acceptedAt: string;
  acceptedAtTimestamp: number;
  acceptedStatus: string;
  createdAt: string;
  createdAtTimestamp: number;
  updatedAt: string;
  updatedAtTimestamp: number;
  setId: ISet;
  supplierId: ISupplier;
  bookmarkId: IBookmark;
  createdBy: IUser;
  updatedBy: IUser;
  [key: string]: any;
}
