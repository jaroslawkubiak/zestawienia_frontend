import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { IConfirmationMessage } from './types/IConfirmationMessage';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationModalService {
  constructor(private confirmationService: ConfirmationService) {}

  showConfirmation(confirmMessage: IConfirmationMessage) {
    const {
      message,
      header,
      accept,
      acceptLabel,
      acceptIcon,
      rejectLabel,
      rejectVisible = true,
    } = confirmMessage;

    this.confirmationService.confirm({
      message,
      header,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: acceptLabel ? acceptLabel : 'Tak',
      acceptIcon: acceptIcon ? acceptIcon : 'pi pi-trash',
      rejectLabel: rejectLabel ? rejectLabel : 'Nie',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptButtonProps: { size: 'large' },
      rejectButtonProps: { size: 'large' },
      rejectVisible: rejectVisible,
      accept,
    });
  }
}
