import { Pipe, PipeTransform } from '@angular/core';
import { isImage } from '../helper';
import { IFileFullDetails } from '../types/IFileFullDetails';

@Pipe({
  name: 'isImage',
  standalone: true, 
})
export class IsImagePipe implements PipeTransform {
  transform(file: IFileFullDetails): boolean {
    return isImage(file);
  }
}
