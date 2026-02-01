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

    // for mobile need to set width manually
    setTimeout(() => {
      const dialogEl = document.querySelector(
        '.p-confirmdialog.p-dialog',
      ) as HTMLElement;
      if (dialogEl) {
        dialogEl.style.visibility = 'hidden';

        if (window.innerWidth <= 768) {
          dialogEl.style.width = '90vw';
          dialogEl.style.maxWidth = '90vw';
        }

        dialogEl.style.visibility = 'visible';

        // handling arrow left and right move
        const acceptButton = dialogEl.querySelector<HTMLButtonElement>(
          '.p-confirmdialog-accept-button',
        );
        const rejectButton = dialogEl.querySelector<HTMLButtonElement>(
          '.p-confirmdialog-reject-button',
        );

        if (!acceptButton) return;

        let focusedButton: HTMLButtonElement = acceptButton;

        const updateFocus = () => {
          acceptButton.classList.remove('keyboard-focused');
          rejectButton?.classList.remove('keyboard-focused');
          focusedButton.classList.add('keyboard-focused');
          focusedButton.focus({ preventScroll: true });
        };

        updateFocus();

        const handleKey = (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            focusedButton.click();
            document.removeEventListener('keydown', handleKey);
          } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            focusedButton =
              focusedButton === acceptButton ? rejectButton! : acceptButton;
            updateFocus();
            event.preventDefault();
          }
        };

        document.addEventListener('keydown', handleKey);
      }
    }, 0);
  }
}
