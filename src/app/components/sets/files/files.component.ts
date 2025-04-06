import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { IFileList } from '../../../services/types/IFileList';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FilesService } from '../../../services/files.service';
import { IFileDetails } from './types/IFileDetails';
import { ConfirmationModalService } from '../../../services/confirmation.service';
import { IConfirmationMessage } from '../../../services/types/IConfirmationMessage';
import { NotificationService } from '../../../services/notification.service';
import { Image } from 'primeng/image';

@Component({
  selector: 'app-files',
  imports: [CommonModule, Dialog, TooltipModule, ButtonModule, Image],
  templateUrl: './files.component.html',
  styleUrl: './files.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class FilesComponent {
  constructor(
    private filesService: FilesService,
    private notificationService: NotificationService,
    private confirmationModalService: ConfirmationModalService
  ) {}
  @Input() setId: string = '';

  BASE_URL = 'http://localhost:3005/uploads/sets/';
  attachments: IFileDetails[] = [];
  attachmentsPdf: IFileDetails[] = [];
  showFilesDialog = false;

  showDialog(filesList: IFileList) {
    this.showFilesDialog = true;
    this.attachments = filesList.files.map((file) => {
      const fileParts = file.split('.');
      const extension = fileParts[fileParts.length - 1].toUpperCase() as
        | 'JPEG'
        | 'PNG'
        | 'JPG'
        | 'PDF';
      return {
        id: Math.floor(Math.random() * 99),
        name: file,
        shortName: fileParts[0],
        extension: extension,
        path: `${this.BASE_URL}${this.setId}/files/${file}`,
        dir: 'files',
      } as IFileDetails;
    });

    this.attachmentsPdf = filesList.pdf.map((file) => {
      const fileParts = file.split('.');
      const extension = fileParts[fileParts.length - 1].toUpperCase() as 'PDF';
      return {
        id: Math.floor(Math.random() * 99),
        name: file,
        shortName: fileParts[0],
        extension: extension,
        path: `${this.BASE_URL}${this.setId}/files/${file}`,
        dir: 'pdf',
      } as IFileDetails;
    });
  }

  // download file to client
  downloadFile(id: number) {
    const file = [...this.attachments, ...this.attachmentsPdf].find((file) => file.id === id);
    if (!file) {
      return;
    }

    this.filesService.downloadAndSaveFile(this.setId, file);
  }

  // delete file form server and remove from list
  deleteFile(id: number) {
    const file = [...this.attachments, ...this.attachmentsPdf].find((file) => file.id === id);
    if (!file) {
      return;
    }

    const accept = () => {
      this.filesService.deleteFile(this.setId, file).subscribe({
        next: (response) => {
          this.notificationService.showNotification(
            response.severity,
            response.message
          );
          this.attachments = this.attachments.filter((file) => file.id !== id);
          this.attachmentsPdf = this.attachmentsPdf.filter((file) => file.id !== id);
        },
        error: (error) => {
          this.notificationService.showNotification('error', error.message);
        },
      });
    };

    const confirmMessage: IConfirmationMessage = {
      header: 'Potwierdź usunięcie załącznika',
      message: `Czy na pewno usunąć załącznik ${file.name}?`,
      accept,
    };

    this.confirmationModalService.showConfirmation(confirmMessage);
  }
}
