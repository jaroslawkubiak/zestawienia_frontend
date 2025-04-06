export interface IFileDetails {
  id: number;
  name: string;
  shortName: string;
  extension: 'JPEG' | 'PNG' | 'JPG' | 'PDF';
  path: string;
  dir: string;
}
