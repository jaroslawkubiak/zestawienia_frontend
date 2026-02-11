import { IClient } from '../../clients/types/IClient';
import { ISet } from '../../sets/types/ISet';
import { ENotificationDirection } from './notification-direction.enum';

export interface ICommentNotificationLogs {
  id: number;
  to: string;
  notificationDirection: ENotificationDirection;
  content: string;
  unreadComments: number;
  needsAttentionComments: number;
  sendAt: string;
  sendAtTimestamp: number;
  set: ISet;
  client: IClient;
}
