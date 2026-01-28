import { IFileFullDetails } from './IFileFullDetails';

export interface IUploadFileResponse {
  message: string;
  files: IFileFullDetails[];
  fileNames: string[];
}
