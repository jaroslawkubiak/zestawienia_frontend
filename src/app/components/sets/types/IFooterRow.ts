import { SafeHtml } from '@angular/platform-browser';

export type IFooterRow = {
  name: string;
  key: string;
  type: 'number' | 'string' | 'select' | 'image';
  value?: number | string;
  unit?: string;
  classTh?: string;
  classTd?: string;
  classFooter?: string;
};
