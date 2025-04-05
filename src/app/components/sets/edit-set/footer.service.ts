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
      value: '',
    }));
  }

  // calculate values for footer row
  calculateFooterRow(footerRow: IFooterRow[], obj: IPosition): IFooterRow[] {
    return footerRow.map((item: IFooterRow) => {
      switch (item.key) {
        case 'ilosc':
          item.value = Number(item.value) + Number(obj.ilosc);
          item.classFooter = 'position-footer-number';
          break;
        case 'netto':
          item.value = (
            Math.round((Number(item.value) + Number(obj.netto)) * 100) / 100
          ).toFixed(2);
          item.classFooter = 'position-footer-number';
          break;
        case 'brutto':
          item.value = (
            Math.round((Number(item.value) + Number(obj.brutto)) * 100) / 100
          ).toFixed(2);
          item.classFooter = 'position-footer-number';
          break;
        case 'wartoscNetto':
          item.value = (
            Math.round((Number(item.value) + Number(obj.wartoscNetto)) * 100) /
            100
          ).toFixed(2);
          item.classFooter = 'position-footer-number';
          break;
        case 'wartoscBrutto':
          item.value = (
            Math.round((Number(item.value) + Number(obj.wartoscBrutto)) * 100) /
            100
          ).toFixed(2);
          item.classFooter = 'position-footer-number';
          break;
      }

      return { ...item };
    });
  }
}
