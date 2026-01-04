import { EFileDirectoryList } from './types/file-directory-list.enum';
import { IFileDirectory } from './types/IFileDirectory';

export const FileDirectoryList: IFileDirectory[] = [
  {
    label: EFileDirectoryList['model3d'],
  },
  {
    label: EFileDirectoryList['moodboard'],
  },
  {
    label: EFileDirectoryList['inspirations'],
    icon: 'pi pi-user',
  },
  {
    label: EFileDirectoryList['drawings'],
  },
  {
    label: EFileDirectoryList['visualizations'],
  },
  {
    label: EFileDirectoryList['working'],
    icon: 'pi pi-eye-slash',
  },
];
