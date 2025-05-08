import { Pipe, PipeTransform } from '@angular/core';
import { isPdf } from '../helper';
import { IFileFullDetails } from '../types/IFileFullDetails';

@Pipe({
  name: 'isPdf',
  standalone: true,
})
export class IsPdfPipe implements PipeTransform {
  transform(file: IFileFullDetails): boolean {
    return isPdf(file);
  }
}
