import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { IConfirmationMessage } from './types/IConfirmationMessage';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationModalService {
  constructor(private confirmationService: ConfirmationService) {}

  showConfirmation(confirmMessage: IConfirmationMessage) {
    const { message, header, accept, acceptLabel, rejectLabel } =
      confirmMessage;

    this.confirmationService.confirm({
      message,
      header,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: acceptLabel ? acceptLabel : 'Tak',
      acceptIcon: 'pi pi-trash',
      rejectLabel: rejectLabel ? rejectLabel : 'Nie',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptButtonProps: { size: 'large' },
      rejectButtonProps: { size: 'large' },
      accept,
    });
  }
}
