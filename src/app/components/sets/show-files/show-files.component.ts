import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { Dialog, DialogModule } from 'primeng/dialog';
import { Image } from 'primeng/image';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationModalService } from '../../../services/confirmation.service';
import { FilesService } from '../../../services/files.service';
import { NotificationService } from '../../../services/notification.service';
import { IConfirmationMessage } from '../../../services/types/IConfirmationMessage';
import { IFileList } from '../../../services/types/IFileList';
import { PdfThumbnailComponent } from '../pdf-thumbnail/pdf-thumbnail.component';
import { IFileDetails } from './types/IFileDetails';

@Component({
  selector: 'app-show-files',
  imports: [
    CommonModule,
    Dialog,
    TooltipModule,
    DialogModule,
    ButtonModule,
    Image,
    PdfThumbnailComponent,
  ],
  templateUrl: './show-files.component.html',
  styleUrl: './show-files.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ShowFilesComponent {
  constructor(
    private sanitizer: DomSanitizer,
    private filesService: FilesService,
    private notificationService: NotificationService,
    private confirmationModalService: ConfirmationModalService
  ) {}
  setId!: number;
  setName: string = '';
  displayPdf = false;
  displayPdfHeader: string = '';
  pdfUrl: SafeResourceUrl = '';
  BASE_URL = 'http://localhost:3005/uploads/sets/';
  attachments: IFileDetails[] = [];
  attachmentsPdf: IFileDetails[] = [];
  showFilesDialog = false;

  showDialog(setId: number, setName: string, filesList: IFileList) {
    this.setId = setId;
    this.setName = setName;
    this.showFilesDialog = true;
    this.attachments = filesList.files.map((file) => {
      const fileParts = file.split('.');
      const extension = fileParts[fileParts.length - 1].toUpperCase() as
        | 'JPEG'
        | 'PNG'
        | 'JPG'
        | 'PDF';
      return {
        id: Math.floor(Math.random() * 9999),
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
        id: Math.floor(Math.random() * 9999),
        name: file,
        shortName: fileParts[0],
        extension: extension,
        path: `${this.BASE_URL}${this.setId}/pdf/${file}`,
        dir: 'pdf',
      } as IFileDetails;
    });
  }

  // download file to client
  downloadFile(id: number) {
    const file = [...this.attachments, ...this.attachmentsPdf].find(
      (file) => file.id === id
    );
    if (!file) {
      return;
    }

    this.filesService.downloadAndSaveFile(this.setId, file);
  }

  // delete file form server and remove from list
  deleteFile(id: number) {
    const file = [...this.attachments, ...this.attachmentsPdf].find(
      (file) => file.id === id
    );
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
          this.attachmentsPdf = this.attachmentsPdf.filter(
            (file) => file.id !== id
          );
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

  // open pdf preview
  openPdf(path: string, fileName: string) {
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(path);
    this.displayPdfHeader = fileName;
    this.displayPdf = true;
  }
}
