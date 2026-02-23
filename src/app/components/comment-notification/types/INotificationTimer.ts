import { ISetLight } from '../../sets/types/ISetLight';
import { ENotificationDirection } from './notification-direction.enum';
import { TTimerStatus } from './timerStatus.type';

export interface INotificationTimer {
  id: number;
  status: TTimerStatus;
  notificationDirection: ENotificationDirection;
  delayMs: number;
  startedAt: Date | string;
  fireAt: Date | string;
  set: ISetLight;
}
