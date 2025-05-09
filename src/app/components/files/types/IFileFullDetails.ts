import { ISet } from '../../sets/types/ISet';

export interface IFileFullDetails {
  id: number;
  fileName: string;
  type: string;
  path: string;
  dir: string;
  description: string;
  size: number;
  width: number;
  height: number;
  setId: ISet;
  createdAt: string;
  createdAtTimestamp: number;
  fullPath?: string;
}
