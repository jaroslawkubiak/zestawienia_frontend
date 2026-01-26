import { IColumnList } from '../../sets/types/IColumnList';

export const ColumnListForSupplier: IColumnList[] = [
  {
    name: 'ZDJĘCIE',
    key: 'image',
    type: 'image',
    classColumn: 'product-img',
  },
  {
    name: 'PRODUKT',
    key: 'produkt',
    type: 'textarea',
  },
  {
    name: 'PRODUCENT',
    key: 'producent',
    type: 'string',
  },
  {
    name: 'KOLEKCJA/SERIA',
    key: 'kolekcja',
    type: 'string',
  },
  {
    name: 'NR KATALOGOWY',
    key: 'nrKatalogowy',
    type: 'string',
  },
  {
    name: 'KOLOR',
    key: 'kolor',
    type: 'string',
  },
  {
    name: 'ILOŚĆ',
    key: 'ilosc',
    type: 'number',
  },
  {
    name: 'POMIESZCZENIE',
    key: 'pomieszczenie',
    type: 'string',
  },
  {
    name: 'LINK',
    key: 'link',
    type: 'link',
  },
];
