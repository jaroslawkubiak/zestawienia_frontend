import { EFileDirectoryList } from './types/file-directory-list.enum';
import { IFileDirectory } from './types/IFileDirectory';

export const FileDirectoryList: IFileDirectory[] = [
  {
    label: EFileDirectoryList['inspirations'],
    icon: 'pi pi-user',
    title: 'Katalog klienta',
  },
  {
    label: EFileDirectoryList['moodboard'],
  },
  {
    label: EFileDirectoryList['functionalLayout'],
  },
  {
    label: EFileDirectoryList['model3d'],
  },
  {
    label: EFileDirectoryList['drawings'],
  },
  {
    label: EFileDirectoryList['visualizations'],
  },
  {
    label: EFileDirectoryList['setPdf'],
  },
  {
    label: EFileDirectoryList['invoice'],
  },
  {
    label: EFileDirectoryList['working'],
    icon: 'pi pi-eye-slash',
    title: 'Katalog ukryty przed klientem',
  },
];
