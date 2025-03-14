interface IColumnList {
  name: string;
  key: string;
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
  },
  {
    name: 'PRODUCENT',
    key: 'producent',
  },
  {
    name: 'KOLEKCJA/SERIA',
    key: 'kolekcja',
  },
  {
    name: 'NR KATALOGOWY',
    key: 'nrKatalogowy',
  },
  {
    name: 'KOLOR',
    key: 'kolor',
  },
  {
    name: 'ILOŚĆ',
    key: 'ilosc',
  },
  {
    name: 'CENA NETTO',
    key: 'netto',
  },
  {
    name: 'CENA BRUTTO',
    key: 'brutto',
  },
  {
    name: 'WARTOŚĆ NETTO',
    key: 'wartoscNetto',
  },
  {
    name: 'WARTOŚĆ BRUTTO',
    key: 'wartoscBrutto',
  },
  {
    name: 'DOSTAWCA',
    key: 'dostawca',
  },
  {
    name: 'POMIESZCZENIE',
    key: 'pomieszczenie',
  },
  {
    name: 'LINK',
    key: 'link',
  },
];
