import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { notificationLifeTime } from '../shared/constans';
import { notificationSeverity } from './types/notificationSeverity.type';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private messageService: MessageService) {}

  showNotification(severity: notificationSeverity, detail: string) {
    let summary = '';
    switch (severity) {
      case 'success':
        summary = 'Sukces';
        break;
      case 'error':
        summary = 'Błąd';
        break;
      case 'info':
        summary = 'Informacja';
        break;
      case 'warn':
        summary = 'Ostrzeżenie';
        break;
    }

    this.messageService.add({
      severity,
      summary,
      detail,
      life: notificationLifeTime,
    });
  }
}
