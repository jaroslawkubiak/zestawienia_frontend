import { SafeHtml } from '@angular/platform-browser';

export type IFooterRow = {
  name: string;
  key: string;
  type: string;
  class?: string;
  value?: SafeHtml | number;
  unit?: string;
};
