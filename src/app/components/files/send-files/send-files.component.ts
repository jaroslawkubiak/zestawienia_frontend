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
import { NotificationService } from '../../../services/notification.service';
import { FilesService } from '../files.service';
import {
  FileDirectoryList,
  IFileDirectoryList,
} from '../types/FileDirectoryList';
import { IFileFullDetails } from '../types/IFileFullDetails';

@Component({
  selector: 'app-send-files',
  imports: [
    CommonModule,
    Dialog,
    FileUpload,
    ProgressBarModule,
    SelectModule,
    FormsModule,
  ],
  templateUrl: './send-files.component.html',
  styleUrls: ['./send-files.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SendFilesComponent {
  constructor(
    private filesService: FilesService,
    private notificationService: NotificationService
  ) {}
  @Input() who!: string;
  @Output() updateFileList = new EventEmitter<IFileFullDetails[]>();
  showSendFilesDialog = false;
  setId!: number;
  setName: string = '';
  @ViewChild('fileUploader') fileUploader: FileUpload | any;
  uploadedFiles: any[] = [];
  uploadProgress = 0;
  fileLimit = 20;

  directoryList: IFileDirectoryList[] = Object.entries(FileDirectoryList).map(
    ([key, value]) => ({
      name: key,
      label: value,
    })
  );

  chooseButtonProps: any = {
    severity: 'primary',
    label: 'Wybierz pliki',
    size: 'large',
    disabled: true,
  };

  uploadButtonProps: any = { severity: 'info', label: 'Wgraj', size: 'large' };
  cancelButtonProps: any = {
    severity: 'danger',
    label: 'Anuluj',
    size: 'large',
  };

  selectedDirectory: string | null = null;

  changeDirectory() {
    this.chooseButtonProps = {
      ...this.chooseButtonProps,
      disabled: !this.selectedDirectory,
    };
  }

  openSendFilesDialog(setId: number, setName: string) {
    this.setId = setId;
    this.setName = setName;
    this.showSendFilesDialog = true;
  }

  openFileDialogManually() {
    const nativeInput =
      this.fileUploader?.el?.nativeElement?.querySelector('input[type="file"]');
    if (nativeInput) {
      nativeInput.click();
    }
  }

  uploadFiles(event: FileUploadHandlerEvent) {
    if (this.selectedDirectory) {
      const files = event.files;
      const formData = new FormData();
      const uploadFolder =
        this.who === 'user' ? this.selectedDirectory : 'inspirations';

        for (let file of files) {
        formData.append('files', file, file.name);
      }

      this.filesService
        .saveFile(+this.setId, formData, uploadFolder)
        .subscribe((event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const percentDone = Math.round((100 * event.loaded) / event.total);
            this.uploadProgress = percentDone;
          } else if (event.type === HttpEventType.Response) {
            this.notificationService.showNotification(
              'info',
              event.body.message
            );
            this.fileUploader.clear();
            this.uploadProgress = 0;
            this.showSendFilesDialog = false;

            const files: IFileFullDetails[] = event.body.files;
            this.updateFileList.emit(files);
          }
        });
    }
  }
}
