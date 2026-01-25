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
    name: 'STATUS',
    key: 'status',
    type: 'select',
    classColumn: 'select-field',
    optionList: 'positionStatus',
    optionLabel: 'label',
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
