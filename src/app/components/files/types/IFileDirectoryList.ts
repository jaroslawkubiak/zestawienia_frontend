import { EFileDirectory } from './file-directory.enum';

export interface IFileDirectoryList {
  type: EFileDirectory;
  label: string;
  safeDirName: string;
  icon?: string;
  title?: string;
}
