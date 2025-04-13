import { Component } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
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
