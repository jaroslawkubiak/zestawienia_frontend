import { EFileDirectory } from './file-directory.enum';

export interface IFileFullDetails {
  id: number;
  fileName: string;
  thumbnail?: string;
  thumbnailPath?: string;
  type: string;
  seenAt: string;
  dir: EFileDirectory;
  dirLabel: string;
  originalName: string;
  path: string;
  setId: number;
  size: number;
  width: number;
  height: number;
  createdAt: string;
  createdAtTimestamp: number;
  fullPath?: string;
  canDelete?: boolean;
  isSelected?: boolean;
}
