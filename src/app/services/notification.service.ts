import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { notificationLifeTime } from '../shared/constans';

type ISeverity = 'success' | 'error' | 'warn' | 'info';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private messageService: MessageService) {}

  showNotification(severity: ISeverity, detail: string) {
    console.log(`##### notyfikacja #####`);
    console.log(severity);
    console.log(detail);
    let summary = '';
    switch (severity) {
      case 'success':
        summary = 'Sukces!!!';
        break;
      case 'error':
        summary = 'Błąd!!!';
        break;
      case 'info':
        summary = 'Informacja!!!';
        break;
      case 'warn':
        summary = 'Ostrzeżenie!!!';
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
