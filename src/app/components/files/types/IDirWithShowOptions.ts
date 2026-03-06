import { EFileDirectory } from "./file-directory.enum";

export interface IDirWithShowOptions {
  dir: EFileDirectory;
  dirLabel: string;
  show: boolean;
}
