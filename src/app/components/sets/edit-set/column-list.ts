export interface IColumnList {
  name: string;
  key: string;
  type: string;
  class?: string;
  width?: number;
}

export const columnList: IColumnList[] = [
  {
    name: 'id',
    key: 'id',
    class: 'hidden',
    type: 'string',
  },
  {
    name: 'KOLEJNOSC',
    key: 'kolejnosc',
    type: 'number',
  },
  {
    name: 'PRODUKT',
    key: 'produkt',
    type: 'string',
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
    name: 'CENA NETTO',
    key: 'netto',
    type: 'number',
  },
  {
    name: 'CENA BRUTTO',
    key: 'brutto',
    type: 'number',
  },
  {
    name: 'WARTOŚĆ NETTO',
    key: 'wartoscNetto',
    type: 'number',
  },
  {
    name: 'WARTOŚĆ BRUTTO',
    key: 'wartoscBrutto',
    type: 'number',
  },
  {
    name: 'DOSTAWCA',
    key: 'dostawca',
    type: 'select',
  },
  {
    name: 'POMIESZCZENIE',
    key: 'pomieszczenie',
    type: 'string',
  },
  {
    name: 'ZDJĘCIE',
    key: 'image',
    type: 'image',
  },
  {
    name: 'LINK',
    key: 'link',
    type: 'string',
  },
];
