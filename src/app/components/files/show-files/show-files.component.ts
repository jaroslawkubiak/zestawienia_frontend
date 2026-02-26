import { BreakpointObserver } from '@angular/cdk/layout';
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
import { ButtonModule } from 'primeng/button';
import { Dialog, DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from '../../../../environments/environment';
import { ConfirmationModalService } from '../../../services/confirmation.service';
import { NotificationService } from '../../../services/notification.service';
import { IConfirmationMessage } from '../../../services/types/IConfirmationMessage';
import { getFormatedDate } from '../../../shared/helpers/getFormatedDate';
import { TAuthorType } from '../../comments/types/authorType.type';
import { ISet } from '../../sets/types/ISet';
import { FileDirectoryList } from '../FileDirectoryList';
import { FilesService } from '../files.service';
import { isImage } from '../helper';
import { EFileDirectory } from '../types/file-directory.enum';
import { IFileFullDetails } from '../types/IFileFullDetails';
import { IRemainingFiles } from '../types/IRemainingFiles';
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
    private cd: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.breakpointObserver
      .observe(['(max-width: 640px)'])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }

  @Input() who!: TAuthorType;
  @Output() deleteFiles = new EventEmitter<IRemainingFiles>();
  setId!: number;
  setHash!: string;
  setName: string = '';
  displayPdf = false;
  displayPdfHeader: string = '';
  pdfUrl: SafeResourceUrl = '';
  files: IFileFullDetails[] = [];
  selectedFiles: IFileFullDetails[] = [];
  showFilesDialog = false;
  defaultView: 'icons' | 'list' = 'icons';
  uniqueDir: { dir: EFileDirectory; dirLabel: string }[] = [];
  isMobile = false;

  showDialog(set: ISet) {
    this.setId = set.id;
    this.setHash = set.hash;
    this.setName = set.name;
    this.showFilesDialog = true;
    this.selectedFiles = [];

    if (set.files) {
      this.files = set.files.map((file) => {
        const fullPath = this.createFilePath(file);
        let thumbnailPath = '';
        if (file.type.toUpperCase() === 'PDF') {
          thumbnailPath = this.createThumbnailPdfPath(file);
        } else {
          thumbnailPath = this.createThumbnailPath(file);
        }

        return {
          ...file,
          fullPath,
          dirLabel: this.findDirLabel(file.dir),
          thumbnailPath,
          canDelete:
            this.who === 'user'
              ? true
              : file.dir === EFileDirectory.INSPIRATIONS,
        };
      });

      this.uniqueDir = this.getUniqueDirectories();
    }
  }

  findDirLabel(dir: EFileDirectory) {
    return FileDirectoryList.find((d) => d.type === dir)!.label;
  }

  createThumbnailPath(file: IFileFullDetails): string {
    if (file.thumbnail) {
      return `${environment.FILES_URL}/${file.path}/${file.thumbnail}`;
    } else {
      return this.createFilePath(file);
    }
  }
  createThumbnailPdfPath(file: IFileFullDetails): string {
    if (file.thumbnail) {
      return `${environment.FILES_URL}/${file.path}/${file.thumbnail}`;
    } else {
      return '';
    }
  }

  createFilePath(file: IFileFullDetails): string {
    return `${environment.FILES_URL}/${file.path}/${file.fileName}`;
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

          if (response.severity === 'error') {
            return;
          }
          this.files = this.files.filter((file) => file.id !== id);

          this.uniqueDir = this.getUniqueDirectories();
          this.selectedFiles = [];

          const deletedFiles: IRemainingFiles = {
            setId: file.setId,
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
    const setId = this.selectedFiles[0]?.setId;

    const accept = () => {
      this.filesService.deleteFiles(ids).subscribe({
        next: () => {
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
          this.uniqueDir = this.getUniqueDirectories();
          this.selectedFiles = [];

          const remainingFiles: IRemainingFiles = {
            setId,
            files: this.files,
          };

          this.deleteFiles.emit(remainingFiles);
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

  changeView(newView: 'icons' | 'list') {
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

  getUniqueDirectories(): { dir: EFileDirectory; dirLabel: string }[] {
    const dirsSet = new Set(this.files.map((f) => f.dir as EFileDirectory));

    return FileDirectoryList.filter((fd) => dirsSet.has(fd.type)).map((fd) => {
      return { dirLabel: fd.label, dir: fd.type };
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
