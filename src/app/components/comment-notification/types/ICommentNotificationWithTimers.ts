import { ICommentNotificationLogs } from './ICommentNotificationLogs';
import { INotificationTimer } from './INotificationTimer';

export interface ICommentNotificationWithTimers {
  commentNotification: ICommentNotificationLogs[];
  timers: INotificationTimer[];
}
