export interface IColumnList {
  name: string;
  key: string;
  type: 'number' | 'string' | 'select' | 'image';
  unit?: string;
  width?: number;
  readOnly?: boolean;
  classHeader?: string;
  classColumn?: string;
  classFooter?: string;
  optionList?: any;
  optionLabel?: string;
  pdfWidth?: number | 50;
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
    pdfWidth: 60,
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
    unit: 'PLN',
    readOnly: true,
    classColumn: 'read-only',
    pdfWidth: 40,
  },
  {
    name: 'WARTOŚĆ BRUTTO',
    key: 'wartoscBrutto',
    type: 'number',
    unit: 'PLN',
    readOnly: true,
    classColumn: 'read-only',
    pdfWidth: 40,
  },

  {
    name: 'DOSTAWCA',
    key: 'supplierId',
    type: 'select',
    classColumn: 'select-field',
    optionList: 'allSuppliers',
    optionLabel: 'company',
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
    name: 'PRODUKT',
    key: 'produkt',
    type: 'string',
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
    name: 'POMIESZCZENIE',
    key: 'pomieszczenie',
    type: 'string',
    pdfWidth: 80,
  },
  {
    name: 'LINK',
    key: 'link',
    type: 'string',
    pdfWidth: 30,
  },
];
