import { IUser } from '../../../login/User';
import { IBookmark } from '../../bookmarks/IBookmark';

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
  createdAt: string;
  createdAtTimestamp: number;
  updatedAt: string;
  updatedAtTimestamp: number;
  supplierId: number;
  bookmarkId: IBookmark;
  createdBy: IUser;
  updatedBy: IUser;
}
