import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { Dialog, DialogModule } from 'primeng/dialog';
import { Image } from 'primeng/image';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationModalService } from '../../../services/confirmation.service';
import { NotificationService } from '../../../services/notification.service';
import { IConfirmationMessage } from '../../../services/types/IConfirmationMessage';
import { PdfThumbnailComponent } from '../pdf-thumbnail/pdf-thumbnail.component';
import { FilesService } from '../files.service';
import { IFileList } from '../types/IFileList';
import { IFileDetails } from '../types/IFileDetails';

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
  @Input() who!: string;
  displayPdf = false;
  displayPdfHeader: string = '';
  pdfUrl: SafeResourceUrl = '';
  attachments: IFileDetails[] = [];
  attachmentsPdf: IFileDetails[] = [];
  attachmentsInspirations: IFileDetails[] = [];
  showFilesDialog = false;

  fileIconMap: Record<string, { icon: string; tooltip: string }> = {
    JPG: { icon: 'pi pi-image', tooltip: 'Obraz JPG' },
    JPEG: { icon: 'pi pi-image', tooltip: 'Obraz JPEG' },
    PNG: { icon: 'pi pi-image', tooltip: 'Obraz PNG' },
    PDF: { icon: 'pi pi-file-pdf', tooltip: 'Plik PDF' },
    TXT: { icon: 'pi pi-file', tooltip: 'Plik TXT' },
    DOCX: { icon: 'pi pi-file-word', tooltip: 'Dokument Word' },
    XLSX: { icon: 'pi pi-file-excel', tooltip: 'Arkusz Excel' },
  };

  showDialog(setId: number, setName: string, filesList: IFileList) {
    this.setId = setId;
    this.setName = setName;
    this.showFilesDialog = true;

    this.attachments = this.filesService.prepareFilesList(
      this.setId,
      filesList
    );

    this.attachmentsPdf = this.filesService.preparePdfFilesList(
      this.setId,
      filesList
    );

    this.attachmentsInspirations =
      this.filesService.prepareInspirationFilesList(this.setId, filesList);
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

  getFileIconData(extension: string) {
    const ext = extension.toUpperCase();
    return (
      this.fileIconMap[ext] ?? {
        icon: 'pi pi-question-circle',
        tooltip: 'Nieznany typ pliku',
      }
    );
  }
}
