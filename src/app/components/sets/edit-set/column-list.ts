export interface IColumnList {
  name: string;
  key: string;
  width?: number;
  class?: string;
}

export const columnList: IColumnList[] = [
  {
    name: 'id',
    key: 'id',
    class: 'hidden',
  },
  {
    name: 'PRODUKT',
    key: 'produkt',
    width: 300,
  },
  {
    name: 'PRODUCENT',
    key: 'producent',
    width: 100,
  },
  {
    name: 'KOLEKCJA/SERIA',
    key: 'kolekcja',
    width: 110,
  },
  {
    name: 'NR KATALOGOWY',
    key: 'nrKatalogowy',
    width: 120,
  },
  {
    name: 'KOLOR',
    key: 'kolor',
    width: 130,
  },
  {
    name: 'ILOŚĆ',
    key: 'ilosc',
    width: 140,
  },
  {
    name: 'CENA NETTO',
    key: 'netto',
    width: 140,
  },
  {
    name: 'CENA BRUTTO',
    key: 'brutto',
    width: 140,
  },
  {
    name: 'WARTOŚĆ NETTO',
    key: 'wartoscNetto',
    width: 140,
  },
  {
    name: 'WARTOŚĆ BRUTTO',
    key: 'wartoscBrutto',
  },
  {
    name: 'DOSTAWCA',
    key: 'dostawca',
    width: 200,
  },
  {
    name: 'POMIESZCZENIE',
    key: 'pomieszczenie',
    width: 200,
  },
  {
    name: 'LINK',
    key: 'link',
    width: 300,
  },
  {
    name: 'ZDJĘCIE',
    key: 'image',
    width: 200,
  },
];
