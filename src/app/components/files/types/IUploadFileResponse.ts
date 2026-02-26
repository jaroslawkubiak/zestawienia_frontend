import { IFileFullDetails } from './IFileFullDetails';

export interface IUploadFileResponse {
  filesCount: number;
  dir: string;
  files: IFileFullDetails[];
  fileNames: string[];
}
