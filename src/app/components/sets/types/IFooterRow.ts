import { SafeHtml } from '@angular/platform-browser';

export type IFooterRow = {
  name: string;
  key: string;
  type: 'number' | 'string' | 'select' | 'image';
  value?: number | string;
  unit?: string;
  classHeader?: string;
  classRow?: string;
  classFooter?: string;
};
