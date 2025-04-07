export interface IColumnList {
  name: string;
  key: string;
  type: 'number' | 'string' | 'select' | 'image';
  value?: number | string;
  unit?: string;
  width?: number;
  readOnly?: boolean;
  classHeader?: string;
  classColumn?: string;
  classFooter?: string;
  optionList?: any;
  optionLabel?: string;
  // action?: (value: any) => any;
}

export const ColumnList: IColumnList[] = [
  {
    name: 'id',
    key: 'id',
    type: 'string',
    classHeader: 'hidden',
    classColumn: 'hidden',
    classFooter: 'hidden',
  },
  {
    name: 'KOLEJNOSC',
    key: 'kolejnosc',
    type: 'string',
    classHeader: 'hidden',
    classColumn: 'hidden',
    classFooter: 'hidden',
  },
  {
    name: 'ZDJĘCIE',
    key: 'image',
    type: 'image',
  },
  {
    name: 'STATUS',
    key: 'status',
    type: 'select',
    classColumn: 'select-field',
    optionList: 'positionStatus',
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
    name: 'DOSTAWCA',
    key: 'supplierId',
    type: 'select',
    classColumn: 'select-field',
    optionList: 'allSuppliers',
    optionLabel: 'firma',
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
    unit: 'PLN',
  },
  {
    name: 'CENA BRUTTO',
    key: 'brutto',
    type: 'number',
    unit: 'PLN',
    readOnly: true,
    classColumn: 'read-only',
  },
  {
    name: 'WARTOŚĆ NETTO',
    key: 'wartoscNetto',
    type: 'number',
    unit: 'PLN',
    readOnly: true,
    classColumn: 'read-only',
  },
  {
    name: 'WARTOŚĆ BRUTTO',
    key: 'wartoscBrutto',
    type: 'number',
    unit: 'PLN',
    readOnly: true,
    classColumn: 'read-only',
  },
  {
    name: 'POMIESZCZENIE',
    key: 'pomieszczenie',
    type: 'string',
  },
  {
    name: 'LINK',
    key: 'link',
    type: 'string',
  },
];
