import { TField } from '../positions-table/types/field.type';

export interface IFooterRow {
  name: string;
  key: string;
  type: TField;
  value?: number | string;
  classHeader?: string;
  classColumn?: string;
  classRow?: string;
  classFooter?: string;
}
