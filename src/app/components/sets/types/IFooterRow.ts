export type IFooterRow = {
  name: string;
  key: string;
  type: 'number' | 'string' | 'select' | 'image';
  value?: number | string;
  unit?: string;
  classHeader?: string;
  classColumn?: string;
  classRow?: string;
  classFooter?: string;
};
