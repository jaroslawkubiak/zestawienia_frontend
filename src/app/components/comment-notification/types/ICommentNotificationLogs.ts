import { IClientLight } from '../../clients/types/IClientLight';
import { ISetLight } from '../../sets/types/ISetLight';
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
  set: ISetLight;
  client: IClientLight;
}
