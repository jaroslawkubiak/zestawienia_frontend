import { IAvatar } from '../../settings/avatars/types/IAvatarList';

export interface IUploadAvatarResponse {
  filesCount: number;
  dir: string;
  files: IAvatar[];
  fileNames: string[];
}
