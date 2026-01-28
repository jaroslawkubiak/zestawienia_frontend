import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
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
import { FileDirectoryList } from '../FileDirectoryList';
import { FilesService } from '../files.service';
import { isImage } from '../helper';
import { EFileDirectoryList } from '../types/file-directory-list.enum';
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
export class ShowFilesComponent implements OnInit {
  constructor(
    private sanitizer: DomSanitizer,
    private filesService: FilesService,
    private notificationService: NotificationService,
    private confirmationModalService: ConfirmationModalService,
    private cd: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.breakpointObserver
      .observe(['(max-width: 640px)'])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }

  @Input() who!: 'user' | 'client';
  @Output() deleteFiles = new EventEmitter<IDeletedFiles>();
  setId!: number;
  setHash!: string;
  setName: string = '';
  displayPdf = false;
  displayPdfHeader: string = '';
  pdfUrl: SafeResourceUrl = '';
  files: IFileFullDetails[] = [];
  selectedFiles: IFileFullDetails[] = [];
  showFilesDialog = false;
  defaultView = 'icons';
  uniqueDir: EFileDirectoryList[] = [];
  isMobile = false;

  ngOnInit(): void {
    // forces pdf worker to load .js
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.js';
  }

  showDialog(set: ISet) {
    this.setId = set.id;
    this.setHash = set.hash;
    this.setName = set.name;
    this.showFilesDialog = true;
    this.selectedFiles = [];

    if (set.files) {
      this.files = set.files.map((file) => {
        const fullPath = `${environment.FILES_URL}/${file.path}/${file.fileName}`;

        return {
          ...file,
          fullPath,
          canDelete:
            this.who === 'user'
              ? true
              : file.dir === EFileDirectoryList.inspirations,
        };
      });

      this.uniqueDir = this.getUniqueDirectory();

      this.generateThumbnailsForFiles();
    }
  }

  // download file to client
  downloadFile(id: number) {
    const file = this.files.find((file) => file.id === id);
    if (!file) {
      return;
    }

    this.filesService.downloadAndSaveFile(file, this.setId);
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
            response.message,
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
      <span>Czy na pewno usunąć plik?</span>
      <span>${file.fileName}</span>
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
    const fileNames: string[] = this.selectedFiles.map((item) => item.fileName);
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
            `Pomyślnie usunięto ${ids.length} ${messageOptions}`,
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
      message: `Czy na pewno usunąć ${
        ids.length
      } ${options}?<br /><br />${fileNames.join('<br />')}`,
      accept,
    };

    this.confirmationModalService.showConfirmation(confirmMessage);
  }

  // open pdf preview
  openPdf(file: IFileFullDetails) {
    const url = `${environment.FILES_URL}/${file.path}/${file.fileName}`;

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

  selectAll(event: PointerEvent): void {
    const checked = (event.target as HTMLInputElement).checked;

    this.selectedFiles = checked ? this.files : [];

    this.cd.markForCheck();
  }

  getUniqueDirectory(): EFileDirectoryList[] {
    const dirsSet = new Set(this.files.map((f) => f.dir));

    return FileDirectoryList.map((fd) => fd.label as EFileDirectoryList).filter(
      (label) => dirsSet.has(label),
    );
  }

  generateThumbnailsForFiles() {
    // Process only files without thumbnails
    const filesToProcess = this.files.filter((f) => !f.thumbnail);

    // Separate images and PDFs
    const images = filesToProcess.filter((f) => isImage(f));
    const pdfs = filesToProcess.filter((f) =>
      f.fileName.toLowerCase().endsWith('.pdf'),
    );

    // Process images - set thumbnail URL directly
    images.forEach((file) => {
      const fullPath = `${environment.FILES_URL}/${file.path}/${file.fileName}`;
      this.files = this.files.map((f) => {
        if (f.id === file.id) {
          return { ...f, thumbnail: fullPath };
        }
        return f;
      });
    });

    // Process PDFs with a slight delay to avoid overloading
    if (pdfs.length > 0) {
      this.cd.detectChanges();

      pdfs.forEach((file, index) => {
        setTimeout(() => {
          this.generatePdfThumbnail(file);
        }, index * 300); // Stagger PDF processing by 300ms
      });
    } else {
      this.cd.detectChanges();
    }
  }

  private generatePdfThumbnail(file: IFileFullDetails) {
    const fullPath = `${environment.FILES_URL}/${file.path}/${file.fileName}`;

    pdfjsLib
      .getDocument(fullPath)
      .promise.then((pdf: any) => {
        pdf
          .getPage(1)
          .then((page: any) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const viewport = page.getViewport({ scale: 0.3 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            return page
              .render({
                canvasContext: context,
                viewport: viewport,
              })
              .promise.then(() => canvas.toDataURL());
          })
          .then((thumbnail: string) => {
            this.files = this.files.map((f) => {
              if (f.id === file.id) {
                return { ...f, thumbnail };
              }
              return f;
            });
            this.cd.detectChanges();
          })
          .catch((error: any) => {
            // Silently skip PDF thumbnail if it fails
            console.debug(
              `Could not generate PDF thumbnail for: ${file.fileName}`,
            );
          });
      })
      .catch((error: any) => {
        // Silently skip PDF thumbnail if it fails
        console.debug(`Could not load PDF for: ${file.fileName}`);
      });
  }

  get isDeleteDisabled(): boolean {
    if (this.selectedFiles.length === 0) {
      return true;
    }

    if (this.who === 'user') {
      return false;
    }

    if (this.who === 'client') {
      return !this.selectedFiles.every((file) => file.canDelete === true);
    }

    return true;
  }
}
