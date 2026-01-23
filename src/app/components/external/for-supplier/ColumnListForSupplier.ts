import { IColumnList } from '../../sets/types/IColumnList';

export const ColumnListForSupplier: IColumnList[] = [
  {
    name: 'ZDJĘCIE',
    key: 'image',
    type: 'image',
    classColumn: 'product-img',
    pdfWidth: 60,
  },
  {
    name: 'PRODUKT',
    key: 'produkt',
    type: 'textarea',
    pdfWidth: 50,
  },
  {
    name: 'STATUS',
    key: 'status',
    type: 'select',
    classColumn: 'select-field',
    optionList: 'positionStatus',
    optionLabel: 'label',
    pdfWidth: 50,
  },
  {
    name: 'PRODUCENT',
    key: 'producent',
    type: 'string',
    pdfWidth: 50,
  },
  {
    name: 'KOLEKCJA/SERIA',
    key: 'kolekcja',
    type: 'string',
    pdfWidth: 95,
  },
  {
    name: 'NR KATALOGOWY',
    key: 'nrKatalogowy',
    type: 'string',
    pdfWidth: 90,
  },
  {
    name: 'KOLOR',
    key: 'kolor',
    type: 'string',
    pdfWidth: 50,
  },

  {
    name: 'ILOŚĆ',
    key: 'ilosc',
    type: 'number',
    pdfWidth: 30,
  },
  {
    name: 'CENA NETTO',
    key: 'netto',
    type: 'number',
    pdfWidth: 40,
  },
  {
    name: 'CENA BRUTTO',
    key: 'brutto',
    type: 'number',
    pdfWidth: 40,
  },
  {
    name: 'WARTOŚĆ NETTO',
    key: 'wartoscNetto',
    type: 'number',
    readOnly: true,
    classColumn: 'read-only',
    pdfWidth: 40,
  },
  {
    name: 'WARTOŚĆ BRUTTO',
    key: 'wartoscBrutto',
    type: 'number',
    readOnly: true,
    classColumn: 'read-only',
    pdfWidth: 40,
  },
  {
    name: 'POMIESZCZENIE',
    key: 'pomieszczenie',
    type: 'string',
    pdfWidth: 80,
  },
  {
    name: 'LINK',
    key: 'link',
    type: 'link',
    pdfWidth: 30,
  },
];
