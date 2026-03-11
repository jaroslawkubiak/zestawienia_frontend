import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ConfirmationModalService } from '../../../services/confirmation.service';
import { NotificationService } from '../../../services/notification.service';
import { IConfirmationMessage } from '../../../services/types/IConfirmationMessage';
import { SendFilesComponent } from '../../files/send-files/send-files.component';
import { IFileFullDetails } from '../../files/types/IFileFullDetails';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-avatars',
  imports: [CommonModule, SendFilesComponent],
  templateUrl: './avatars.component.html',
  styleUrl: './avatars.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AvatarsComponent {
  avatars: string[] = [];
  AVATAR_URL = '/avatars/clients';
  @ViewChild(SendFilesComponent) dialogSendFilesComponent!: SendFilesComponent;

  constructor(
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private confirmationModalService: ConfirmationModalService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.settingsService.getAvatars().subscribe({
      next: (response) => {
        this.avatars = [...response];
      },
    });

    this.cd.markForCheck();
  }

  openSendFilesDialog() {
    this.dialogSendFilesComponent.openSendAvatarDialog();
  }

  deleteAvatar(fileName: string) {
    const accept = () => {
      this.settingsService.deleteAvatarFile(fileName).subscribe({
        next: (response) => {
          this.notificationService.showNotification(
            response.severity,
            response.message,
          );
          if (response.severity === 'error') {
            return;
          }
          this.avatars = this.avatars.filter((avatar) => avatar !== fileName);

          this.cd.markForCheck();
        },
        error: (error) => {
          this.notificationService.showNotification('error', error.message);
        },
      });
    };

    const deleteFilePreview = `<img class="img-delete" src="${this.getAvatarUrl(fileName)}" alt="${fileName}" />`;

    const confirmMessage: IConfirmationMessage = {
      header: 'Potwierdź usunięcie',
      message: `<div class="delete-file-wrapper">
          <span>Czy na pewno usunąć plik avatara?</span>
          <span>${fileName}</span>
          ${deleteFilePreview}
          </div>`,
      accept,
    };

    this.confirmationModalService.showConfirmation(confirmMessage);
  }

  updateAttachedFiles(uploadedFiles: IFileFullDetails[]) {
    const fileNames = uploadedFiles.map((file) => file.fileName);
    this.avatars = [...(this.avatars || []), ...fileNames];
  }

  getAvatarUrl(avatar: string): string {
    return `${environment.FILES_URL}/${this.AVATAR_URL}/${avatar}`;
  }
}
