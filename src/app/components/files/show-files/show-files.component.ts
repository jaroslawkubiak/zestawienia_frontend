import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as pdfjsLib from 'pdfjs-dist';
import { ButtonModule } from 'primeng/button';
import { Dialog, DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from '../../../../environments/environment';
import { ConfirmationModalService } from '../../../services/confirmation.service';
import { NotificationService } from '../../../services/notification.service';
import { IConfirmationMessage } from '../../../services/types/IConfirmationMessage';
import { getFormatedDate } from '../../../shared/helpers/getFormatedDate';
import { ISet } from '../../sets/types/ISet';
import { FilesService } from '../files.service';
import { isImage } from '../helper';
import { IDeletedFiles } from '../types/IDeletedFiles';
import { IFileFullDetails } from '../types/IFileFullDetails';
import { IconsViewComponent } from './icons-view/icons-view.component';
import { ListViewComponent } from './list-view/list-view.component';

@Component({
  selector: 'app-show-files',
  imports: [
    CommonModule,
    Dialog,
    TooltipModule,
    DialogModule,
    ButtonModule,
    IconsViewComponent,
    ListViewComponent,
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
    private confirmationModalService: ConfirmationModalService,
    private cd: ChangeDetectorRef
  ) {}
  @Input() who!: 'user' | 'client';
  @Output() deleteFiles = new EventEmitter<IDeletedFiles>();
  setId!: number;
  setName: string = '';
  displayPdf = false;
  displayPdfHeader: string = '';
  pdfUrl: SafeResourceUrl = '';
  files: IFileFullDetails[] = [];
  selectedFiles: IFileFullDetails[] = [];
  showFilesDialog = false;
  defaultView = 'list';
  uniqueDir: string[] = [];

  showDialog(set: ISet) {
    this.setId = set.id;
    this.setName = set.name;
    this.showFilesDialog = true;
    this.selectedFiles = [];

    if (set.files) {
      this.files = set.files.map((file) => {
        const fullPath = `${environment.FILES_URL}${file.path}/${file.fileName}`;

        return { ...file, fullPath };
      });

      this.uniqueDir = this.getUniqueDirectory();

      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'assets/pdfjs/pdf.worker.min.mjs';
      }
      this.generateThumbnailsForFiles();
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
          this.uniqueDir = this.getUniqueDirectory();
          this.selectedFiles = [];

          const deletedFiles: IDeletedFiles = {
            setId: file.setId.id,
            files: this.files,
          };

          this.deleteFiles.emit(deletedFiles);
          this.cd.markForCheck();
        },
        error: (error) => {
          this.notificationService.showNotification('error', error.message);
        },
      });
    };

    const deleteFilePreview = isImage(file)
      ? `<img class="img-delete" src="${file.fullPath}" alt="${file.fileName}" />`
      : '';

    const confirmMessage: IConfirmationMessage = {
      header: 'Potwierdź usunięcie',
      message: `<div class="delete-file-wrapper">
      Czy na pewno usunąć plik ${file.fileName}? 
      ${deleteFilePreview}
      </div>`,
      accept,
    };

    this.confirmationModalService.showConfirmation(confirmMessage);
  }

  // batch delete selected files form server and remove from list
  onDeleteFiles() {
    if (this.selectedFiles.length === 0) {
      return;
    }

    const ids: number[] = this.selectedFiles.map((item) => item.id);
    const setId = this.selectedFiles[0]?.setId.id;

    const accept = () => {
      this.filesService.deleteFiles(ids).subscribe({
        next: (response) => {
          const messageOptions = (() => {
            if (ids.length === 1) return 'plik';
            if (ids.length > 1 && ids.length < 5) return 'pliki';
            return 'plików';
          })();

          this.notificationService.showNotification(
            'success',
            `Pomyślnie usunięto ${ids.length} ${messageOptions}`
          );

          this.files = this.files.filter((file) => !ids.includes(file.id));
          this.uniqueDir = this.getUniqueDirectory();
          this.selectedFiles = [];

          const deletedFiles: IDeletedFiles = {
            setId,
            files: this.files,
          };

          this.deleteFiles.emit(deletedFiles);
          this.cd.markForCheck();
        },
        error: (error) => {
          this.notificationService.showNotification('error', error.message);
        },
      });
    };

    const options = (() => {
      if (ids.length === 1) return 'zaznaczony plik';
      if (ids.length > 1 && ids.length < 5) return 'zaznaczone pliki';
      return 'zaznaczonych plików';
    })();

    const confirmMessage: IConfirmationMessage = {
      header: 'Potwierdź usunięcie',
      message: `Czy na pewno usunąć ${ids.length} ${options}?`,
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

  changeView(newView: string) {
    this.defaultView = newView;
  }

  downloadFiles() {
    const sanitazeName = this.setName
      .trim()
      .replace(/\s+/g, '-')
      .replace(/:/g, '-')
      .replace(/[()]/g, '');

    const ids: number[] = this.selectedFiles.map((item) => item.id);
    this.filesService.downloadFiles(ids).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitazeName + '-' + getFormatedDate()}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  addFileToSelected(file: IFileFullDetails) {
    const exists = this.selectedFiles.some((el) => el.id === file.id);

    if (exists) {
      this.selectedFiles = this.selectedFiles.filter((el) => el.id !== file.id);
    } else {
      this.selectedFiles = [...this.selectedFiles, file];
    }
  }

  selectAll(event: any) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selectedFiles = [...this.files];
    } else {
      this.selectedFiles = [];
    }

    this.cd.markForCheck();
  }

  getUniqueDirectory() {
    const sortedFiles = [...this.files];
    sortedFiles.sort((a, b) => a.dir.localeCompare(b.dir));

    return [...new Set(sortedFiles.map((item) => item.dir))];
  }

  generateThumbnailsForFiles() {
    this.files.forEach((file) => {
      if (!file.thumbnail) {
        const fullPath = `${environment.FILES_URL}${file.path}/${file.fileName}`;

        pdfjsLib.getDocument(fullPath).promise.then((pdf: any) => {
          pdf.getPage(1).then((page: any) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const viewport = page.getViewport({ scale: 0.3 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            page
              .render({
                canvasContext: context,
                viewport: viewport,
              })
              .promise.then(() => {
                const thumbnail = canvas.toDataURL();

                this.files = this.files.map((f) => {
                  if (f.id === file.id) {
                    return { ...f, thumbnail };
                  }
                  return f;
                });

                this.cd.detectChanges();
              });
          });
        });
      }
    });
  }
}
