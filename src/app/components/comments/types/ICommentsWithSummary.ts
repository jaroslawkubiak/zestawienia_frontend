import { IComment } from './IComment';
import { IFilesWithUnreadComments } from './IFilesWithUnreadComments';

export interface ICommentsWithSummary {
  comments: IComment[];

  files: IFilesWithUnreadComments[];
}
