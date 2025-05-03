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
  calculateFooterRow(footerRow: IFooterRow[], positions: IPosition[]): IFooterRow[] {
    const totals = positions.reduce(
      (acc, position) => {
        acc.wartoscNetto += Number(position.wartoscNetto) || 0;
        acc.wartoscBrutto += Number(position.wartoscBrutto) || 0;
        return acc;
      },
      { wartoscNetto: 0, wartoscBrutto: 0 }
    );

    return footerRow.map((item: IFooterRow) => {
      if (item.key === 'wartoscNetto') {
        return { ...item, value: totals.wartoscNetto };
      }

      if (item.key === 'wartoscBrutto') {
        return { ...item, value: totals.wartoscBrutto };
      }

      return item;
    });
  }
}
