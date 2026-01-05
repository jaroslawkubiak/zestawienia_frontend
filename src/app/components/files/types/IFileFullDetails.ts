import { ISet } from '../../sets/types/ISet';
import { EFileDirectoryList } from './file-directory-list.enum';

export interface IFileFullDetails {
  id: number;
  fileName: string;
  type: string;
  path: string;
  dir: EFileDirectoryList;
  description: string;
  size: number;
  width: number;
  height: number;
  setId: ISet;
  createdAt: string;
  createdAtTimestamp: number;
  fullPath?: string;
  thumbnail?: string;
  canDelete?: boolean;
}
