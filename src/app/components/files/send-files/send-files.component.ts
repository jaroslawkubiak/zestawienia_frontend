import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { FileUpload, FileUploadHandlerEvent } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationService } from '../../../services/notification.service';
import { TAuthorType } from '../../comments/types/authorType.type';
import { FileDirectoryList } from '../FileDirectoryList';
import { FilesService } from '../files.service';

import { EFileDirectory } from '../types/file-directory.enum';
import { IFileDirectoryList } from '../types/IFileDirectoryList';
import { IFileFullDetails } from '../types/IFileFullDetails';
import { TFileUploadButton } from './types/buttons.type';

@Component({
  selector: 'app-send-files',
  imports: [
    CommonModule,
    Dialog,
    FileUpload,
    ProgressBarModule,
    SelectModule,
    FormsModule,
    TooltipModule,
  ],
  templateUrl: './send-files.component.html',
  styleUrls: ['./send-files.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SendFilesComponent {
  constructor(
    private filesService: FilesService,
    private notificationService: NotificationService,
    private breakpointObserver: BreakpointObserver,
    private cdr: ChangeDetectorRef,
  ) {
    this.breakpointObserver
      .observe(['(max-width: 640px)'])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }

  @Input() who!: TAuthorType;
  @Output() updateFileList = new EventEmitter<IFileFullDetails[]>();

  showSendFilesDialog = false;
  setId!: number;
  setHash!: string;
  setName: string = '';
  @ViewChild('fileUploader') fileUploader: FileUpload | any;
  uploadedFiles: any[] = [];
  uploadProgress = 0;
  fileLimit = 30;
  selectedDirectory!: IFileDirectoryList;
  directoryList: IFileDirectoryList[] = FileDirectoryList;
  isMobile = false;
  isUploading = false;
  hasFiles = false;

  get chooseButtonProps(): TFileUploadButton {
    return {
      severity: 'primary',
      label: 'Wybierz pliki',
      size: 'large',
      disabled: this.isUploading || !this.selectedDirectory,
    };
  }

  get uploadButtonProps(): TFileUploadButton {
    return {
      severity: 'info',
      label: this.isUploading ? 'Wgrywanie...' : 'Wgraj',
      size: 'large',
      disabled: !this.hasFiles || this.isUploading,
    };
  }

  get cancelButtonProps(): TFileUploadButton {
    return {
      severity: 'danger',
      label: 'Anuluj',
      size: 'large',
      disabled: !this.hasFiles || this.isUploading,
    };
  }

  onFileSelect() {
    this.updateHasFiles();
  }

  onFileRemove() {
    queueMicrotask(() => {
      this.updateHasFiles();
    });
  }

  onFileClear() {
    this.updateHasFiles();
  }

  private updateHasFiles() {
    this.hasFiles = !!this.fileUploader?.files?.length;
  }

  onSelectOpen() {
    requestAnimationFrame(() => {
      const panel = document.querySelector(
        '.p-select-overlay .p-select-list-container',
      ) as HTMLElement;

      if (panel) {
        panel.style.maxHeight = '300px';
      }
    });
  }

  openSendFilesDialog(setId: number, setHash: string, setName: string) {
    this.setId = setId;
    this.setHash = setHash;
    this.setName = setName;
    this.showSendFilesDialog = true;

    if (this.who === 'client') {
      this.selectedDirectory = FileDirectoryList.find(
        (d) => d.type === EFileDirectory.INSPIRATIONS,
      )!;
    }
  }

  openFileDialogManually() {
    const nativeInput =
      this.fileUploader?.el?.nativeElement?.querySelector('input[type="file"]');
    if (nativeInput) {
      nativeInput.click();
    }
  }

  uploadFiles(event: FileUploadHandlerEvent) {
    if (!this.selectedDirectory) {
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 10;

    const files = event.files;
    const formData = new FormData();
    const uploadFolder =
      this.who === 'user'
        ? this.selectedDirectory.type
        : EFileDirectory.INSPIRATIONS;

    for (let file of files) {
      formData.append('files', file, file.name);
    }

    this.filesService
      .saveFile(+this.setId, this.setHash, formData, uploadFolder)
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round(
              (100 * event.loaded) / event.total,
            );
          }
          this.cdr.detectChanges();

          if (event.type === HttpEventType.Response && event.body) {
            this.fileUploader.clear();
            this.showSendFilesDialog = false;

            const files: IFileFullDetails[] = event.body.files;
            this.updateFileList.emit(files);
            this.completeUpload();

            const uploadMessage = this.returnUploadMessage(event.body.filesCount, event.body.dir);

            // success - file saved
            this.notificationService.showNotification(
              'success',
              uploadMessage,
            );
          }
        },

        error: (err) => {
          let message = 'Wystąpił błąd podczas przesyłania pliku';

          if (err.error?.message) {
            message = Array.isArray(err.error.message)
              ? err.error.message.join(', ')
              : err.error.message;
          }
          this.completeUpload();

          this.notificationService.showNotification('error', message);
        },
      });
  }

  returnUploadMessage(filesCount: number, dir: string): string {
    const directory = FileDirectoryList.find((d) => d.type === dir)!;

    const fileWord =
      filesCount === 1 ? 'plik' : filesCount < 5 ? 'pliki' : 'plików';

    return `Pomyślnie przesłano ${filesCount} ${fileWord} do katalogu "${directory.label}"`;
  }

  completeUpload() {
    this.uploadProgress = 0;
    this.isUploading = false;
  }
}
