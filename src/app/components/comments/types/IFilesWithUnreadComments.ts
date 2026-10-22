import { IUnreadComments } from "./IUnreadComments";

export interface IFilesWithUnreadComments {
  fileId: number;
  unreadComments: IUnreadComments;
}
