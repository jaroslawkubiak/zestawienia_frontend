import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Tooltip } from 'primeng/tooltip';
import { environment } from '../../../../environments/environment';
import { ConfirmationModalService } from '../../../services/confirmation.service';
import { NotificationService } from '../../../services/notification.service';
import { IConfirmationMessage } from '../../../services/types/IConfirmationMessage';
import { IClient } from '../../clients/types/IClient';
import { SendFilesComponent } from '../../files/send-files/send-files.component';
import { IUploadAvatarResponse } from '../../files/types/IUploadAvatarResponse';
import { SettingsService } from '../settings.service';
import { IAvatar } from './types/IAvatarList';

@Component({
  selector: 'app-avatars',
  imports: [CommonModule, SendFilesComponent, Tooltip],
  templateUrl: './avatars.component.html',
  styleUrl: './avatars.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AvatarsComponent {
  avatars: IAvatar[] = [];
  clientAvatars: IAvatar[] = [];
  AVATAR_URL = '/avatars/clients';
  header = 'Avatary klientów';
  clientHeader = 'Avatary wgrane przez klientów';
  @Input() client!: IClient | null;
  @ViewChild(SendFilesComponent) dialogSendFilesComponent!: SendFilesComponent;

  @Output() onSetNewAvatar = new EventEmitter();

  constructor(
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private confirmationModalService: ConfirmationModalService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadData();
    if (this.client) {
      this.header = 'Dostępne avatary';
      this.clientHeader = 'Twój avatar';
    }
  }

  loadData() {
    this.settingsService.getAvatars(this.client?.id ?? null).subscribe({
      next: (response) => {
        this.sortAvatars(response);
      },
    });

    this.cd.markForCheck();
  }
  
  sortAvatars(avatars: IAvatar[]) {
    this.avatars = [];
    this.clientAvatars = [];
    avatars.map((avatar) => {
      if (avatar.clientName) {
        this.clientAvatars.push(avatar);
      } else {
        this.avatars.push(avatar);
      }
    });
  }

  setAvatar(avatarId: number) {
    if (this.client) {
      this.settingsService.setAvatar(this.client.id, avatarId).subscribe({
        next: (response) => {
          this.notificationService.showNotification(
            'success',
            'Avatar został zmieniony',
          );

          this.onSetNewAvatar.emit(response);
          this.loadData();
        },
        error: (error) => {
          this.notificationService.showNotification('error', error.message);
        },
      });
    }
  }

  updateAvatarList(response: IUploadAvatarResponse) {
    this.setAvatar(response.files[0].id);
  }

  openSendFilesDialog() {
    this.dialogSendFilesComponent.openSendAvatarDialog(this.client?.id ?? null, this.clientAvatars);
  }

  updateAttachedFiles() {
    this.loadData();
  }

  deleteAvatar(avatar: IAvatar) {
    const accept = () => {
      this.settingsService.deleteAvatarFile(avatar.id).subscribe({
        next: (response) => {
          this.notificationService.showNotification(
            response.severity,
            response.message,
          );

          if (response.severity === 'error') {
            return;
          }

          this.avatars = this.avatars.filter(
            (avatar) => avatar.fileName !== response.fileName,
          );

          this.cd.markForCheck();
        },
        error: (error) => {
          this.notificationService.showNotification('error', error.message);
        },
      });
    };

    const deleteFilePreview = `<img class="img-delete" src="${this.getAvatarUrl(avatar)}" alt="${avatar.fileName}" />`;

    const confirmMessage: IConfirmationMessage = {
      header: 'Potwierdź usunięcie',
      message: `<div class="delete-file-wrapper">
          <span>Czy na pewno usunąć ten avatar?</span>
          ${deleteFilePreview}
          </div>`,
      accept,
    };

    this.confirmationModalService.showConfirmation(confirmMessage);
  }

  getAvatarUrl(avatar: IAvatar): string {
    return `${environment.FILES_URL}/${avatar.path}/${avatar.fileName}`;
  }
}
