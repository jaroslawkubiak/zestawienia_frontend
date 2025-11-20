import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { NotificationService } from '../../../services/notification.service';
type ISeverity = 'success' | 'error' | 'warn' | 'info';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
  standalone: true,
  imports: [ButtonModule, ToastModule],
})
export class NotificationComponent {
  constructor(private notificationService: NotificationService) {}

  send(severity: ISeverity, message: string) {
    this.notificationService.showNotification(severity, message);
  }
}
