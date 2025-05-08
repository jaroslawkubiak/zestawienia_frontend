import { IFileFullDetails } from './types/IFileFullDetails';

export function isImage(file: IFileFullDetails): boolean {
  return ['JPG', 'JPEG', 'PNG'].includes(file?.type?.toUpperCase());
}

export function isPdf(file: IFileFullDetails): boolean {
  return file?.type?.toUpperCase() === 'PDF';
}
