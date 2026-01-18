import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import {
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
import { FileDirectoryList } from '../FileDirectoryList';
import { FilesService } from '../files.service';
import { EFileDirectoryList } from '../types/file-directory-list.enum';
import { IFileDirectory } from '../types/IFileDirectory';
import { IFileFullDetails } from '../types/IFileFullDetails';
import { NotificationService } from '../../../services/notification.service';

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
  ) {
    this.breakpointObserver
      .observe(['(max-width: 640px)'])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }

  @Input() who!: 'user' | 'client';
  @Output() updateFileList = new EventEmitter<IFileFullDetails[]>();

  showSendFilesDialog = false;
  setId!: number;
  setHash!: string;
  setName: string = '';
  @ViewChild('fileUploader') fileUploader: FileUpload | any;
  uploadedFiles: any[] = [];
  uploadProgress = 0;
  fileLimit = 20;
  selectedDirectory!: IFileDirectory;
  directoryList: IFileDirectory[] = FileDirectoryList;
  isMobile = false;

  chooseButtonProps: any = {
    severity: 'primary',
    label: 'Wybierz pliki',
    size: 'large',
    disabled: this.who === 'user',
  };

  uploadButtonProps: any = { severity: 'info', label: 'Wgraj', size: 'large' };
  cancelButtonProps: any = {
    severity: 'danger',
    label: 'Anuluj',
    size: 'large',
  };

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

  changeDirectory() {
    this.chooseButtonProps = {
      ...this.chooseButtonProps,
      disabled: !this.selectedDirectory,
    };
  }

  openSendFilesDialog(setId: number, setHash: string, setName: string) {
    this.setId = setId;
    this.setHash = setHash;
    this.setName = setName;
    this.showSendFilesDialog = true;

    if (this.who === 'client') {
      this.selectedDirectory = {
        label: EFileDirectoryList['inspirations'],
        icon: 'pi pi-user',
      };
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

    const files = event.files;
    const formData = new FormData();
    const uploadFolder =
      this.who === 'user'
        ? this.selectedDirectory.label
        : EFileDirectoryList['inspirations'];

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

          if (event.type === HttpEventType.Response) {
            this.fileUploader.clear();
            this.uploadProgress = 0;
            this.showSendFilesDialog = false;

            const files: IFileFullDetails[] = event.body.files;
            this.updateFileList.emit(files);

            // success - file saved
            this.notificationService.showNotification(
              'success',
              event.body.message,
            );
          }
        },

        error: (err) => {
          this.uploadProgress = 0;

          let message = 'Wystąpił błąd podczas przesyłania pliku';

          if (err.error?.message) {
            message = Array.isArray(err.error.message)
              ? err.error.message.join(', ')
              : err.error.message;
          }

          this.notificationService.showNotification('error', message);
        },
      });
  }
}
