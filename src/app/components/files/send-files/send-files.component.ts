import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { FileUpload, FileUploadHandlerEvent } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { NotificationService } from '../../../services/notification.service';
import { FilesService } from '../files.service';

@Component({
  selector: 'app-send-files',
  imports: [CommonModule, Dialog, FileUpload, ProgressBarModule],
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
  showSendFilesDialog = false;
  setId!: number;
  setName: string = '';
  @ViewChild('fileUploader') fileUploader: FileUpload | any;
  uploadedFiles: any[] = [];
  uploadProgress = 0;
  fileLimit = 10;
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
    const files = event.files;
    const formData = new FormData();

    for (let file of files) {
      formData.append('files', file, file.name);
    }

    this.filesService.saveFile(+this.setId, formData).subscribe((event) => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        const percentDone = Math.round((100 * event.loaded) / event.total);
        this.uploadProgress = percentDone;
      } else if (event.type === HttpEventType.Response) {
        this.notificationService.showNotification(
          'info',
          'Pliki zostały przesłane na serwer'
        );
        this.fileUploader.clear();
        this.uploadProgress = 0;
        this.showSendFilesDialog = false;
      }
    });
  }
}
