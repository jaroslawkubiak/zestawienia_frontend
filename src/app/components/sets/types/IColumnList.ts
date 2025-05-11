import { TField } from './field.type';

export interface IColumnList {
  name: string;
  key: string;
  type: TField;
  width?: number;
  readOnly?: boolean;
  classHeader?: string;
  classColumn?: string;
  classFooter?: string;
  optionList?: any;
  optionLabel?: string;
  pdfWidth?: number | 50;
}
