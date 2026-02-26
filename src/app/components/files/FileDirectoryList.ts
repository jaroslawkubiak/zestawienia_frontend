import { EFileDirectory } from './types/file-directory.enum';
import { IFileDirectoryList } from './types/IFileDirectoryList';

export const FileDirectoryList: IFileDirectoryList[] = [
  {
    type: EFileDirectory.INSPIRATIONS,
    label: 'Inspiracje',
    safeDirName: 'Inspiracje',
    icon: 'pi pi-user',
    title: 'Katalog klienta',
  },
  {
    type: EFileDirectory.MOODBOARD,
    label: 'Moodboardy',
    safeDirName: 'Moodboardy',
  },
  {
    type: EFileDirectory.FUNCTIONAL_LAYOUT,
    label: 'Układ funkcjonalny',
    safeDirName: 'Uklad funkcjonalny',
  },
  {
    type: EFileDirectory.MODEL_3D,
    label: 'Model 3D',
    safeDirName: 'Model 3D',
  },
  {
    type: EFileDirectory.DRAWINGS,
    label: 'Rysunki techniczne',
    safeDirName: 'Rysunki techniczne',
  },
  {
    type: EFileDirectory.VISUALIZATIONS,
    label: 'Wizualizacje',
    safeDirName: 'Wizualizacje',
  },
  {
    type: EFileDirectory.SET_PDF,
    label: 'Zestawienie w pdf',
    safeDirName: 'Zestawienie w pdf',
  },
  {
    type: EFileDirectory.INVOICE,
    label: 'Faktury',
    safeDirName: 'Faktury',
  },
  {
    type: EFileDirectory.WORKING,
    label: 'Robocze',
    safeDirName: 'Robocze',
    icon: 'pi pi-eye-slash',
    title: 'Katalog ukryty przed klientem',
  },
];
