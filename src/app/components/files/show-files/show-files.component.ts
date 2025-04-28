import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { Dialog, DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from '../../../../environments/environment';
import { ConfirmationModalService } from '../../../services/confirmation.service';
import { NotificationService } from '../../../services/notification.service';
import { IConfirmationMessage } from '../../../services/types/IConfirmationMessage';
import { ISet } from '../../sets/types/ISet';
import { FilePreviewComponent } from '../file-preview/file-preview.component';
import { FilesService } from '../files.service';
import { IFileFullDetails } from '../types/IFileFullDetails';

@Component({
  selector: 'app-show-files',
  imports: [
    CommonModule,
    Dialog,
    TooltipModule,
    DialogModule,
    ButtonModule,
    FilePreviewComponent,
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
  files: IFileFullDetails[] = [];
  showFilesDialog = false;

  showDialog(set: ISet) {
    this.setId = set.id;
    this.setName = set.name;
    this.showFilesDialog = true;

    if (set.files) {
      this.files = set.files.map((file) => {
        const fullPath = `${environment.FILES_URL}${file.path}/${file.fileName}`;

        return { ...file, fullPath };
      });
    }
  }

  // download file to client
  downloadFile(id: number) {
    const file = this.files.find((file) => file.id === id);
    if (!file) {
      return;
    }

    this.filesService.downloadAndSaveFile(file);
  }

  // delete file form server and remove from list
  deleteFile(id: number) {
    const file = this.files.find((file) => file.id === id);
    if (!file) {
      return;
    }

    const accept = () => {
      this.filesService.deleteFile(id).subscribe({
        next: (response) => {
          this.notificationService.showNotification(
            response.severity,
            response.message
          );
          this.files = this.files.filter((file) => file.id !== id);
        },
        error: (error) => {
          this.notificationService.showNotification('error', error.message);
        },
      });
    };

    const confirmMessage: IConfirmationMessage = {
      header: 'Potwierdź usunięcie załącznika',
      message: `Czy na pewno usunąć załącznik ${file.fileName}?`,
      accept,
    };

    this.confirmationModalService.showConfirmation(confirmMessage);
  }

  // open pdf preview
  openPdf(file: IFileFullDetails) {
    const url = `${environment.FILES_URL}${file.path}/${file.fileName}`;

    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.displayPdfHeader = file.fileName;
    this.displayPdf = true;
  }
}
