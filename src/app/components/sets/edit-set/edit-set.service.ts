import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { notificationLifeTime } from '../../../shared/constans';

@Injectable({
  providedIn: 'root',
})
export class EditSetService {
  constructor(private messageService: MessageService) {}

  showNotification(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: notificationLifeTime,
    });
  }
}
