import { EFileDirectory } from './file-directory.enum';

export interface IFileFullDetails {
  id: number;
  fileName: string;
  type: string;
  path: string;
  dir: EFileDirectory;
  dirLabel: string;
  originalName: string;
  size: number;
  width: number;
  height: number;
  setId: number;
  createdAt: string;
  createdAtTimestamp: number;
  fullPath?: string;
  thumbnail?: string;
  thumbnailPath?: string;
  canDelete?: boolean;
  isSelected?: boolean;
}
