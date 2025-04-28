import { Injectable } from '@angular/core';
import { IFooterRow } from '../types/IFooterRow';
import { IPosition } from '../types/IPosition';

@Injectable({
  providedIn: 'root',
})
export class FooterService {
  constructor() {}

  // reset footer values
  resetFooter(footerRow: IFooterRow[]): IFooterRow[] {
    return footerRow.map((item: IFooterRow) => ({
      ...item,
      value:
        item.key === 'wartoscNetto' || item.key === 'wartoscBrutto' ? 0 : '',
    }));
  }

  // calculate values for footer row
  calculateFooterRow(footerRow: IFooterRow[], obj: IPosition): IFooterRow[] {
    return footerRow.map((item: IFooterRow) => {
      if (item.key === 'wartoscNetto') {
        item.value = Number(item.value) + Number(obj.wartoscNetto);
      }
      if (item.key === 'wartoscBrutto') {
        item.value = Number(item.value) + Number(obj.wartoscBrutto);
      }

      return { ...item };
    });
  }
}
