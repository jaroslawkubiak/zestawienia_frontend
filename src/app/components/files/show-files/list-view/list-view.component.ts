import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { isImage, isPdf } from '../../helper';
import { PdfThumbnailComponent } from '../../pdf-thumbnail/pdf-thumbnail.component';
import { IsImagePipe } from '../../pipe/is-image.pipe';
import { IsPdfPipe } from '../../pipe/is-pdf.pipe';
import { IFileFullDetails } from '../../types/IFileFullDetails';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-list-view',
  imports: [
    TableModule,
    FormsModule,
    CommonModule,
    TooltipModule,
    CheckboxModule,
    ButtonModule,
    ImageModule,
    PdfThumbnailComponent,
    IsImagePipe,
    IsPdfPipe,
  ],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ListViewComponent implements OnChanges {
  @Input() who!: 'user' | 'client';
  @Input() files: IFileFullDetails[] = [];
  @Input() selectedFiles: IFileFullDetails[] = [];
  @Output() downloadFile = new EventEmitter<number>();
  @Output() deleteFile = new EventEmitter<number>();
  @Output() deleteFiles = new EventEmitter<void>();
  @Output() clearSelectedFiles = new EventEmitter<void>();
  @Output() openPdf = new EventEmitter<IFileFullDetails>();
  @Output() addFileToSelected = new EventEmitter<IFileFullDetails>();
  @Output() selectAll = new EventEmitter<any>();
  @Output() downloadFiles = new EventEmitter<any>();
  @Output() selectedFilesChange = new EventEmitter<IFileFullDetails[]>();

  ngOnChanges(changes: SimpleChanges): void {
    this.clearSelectedFiles.emit();
    if (this.files) {
      this.files = this.files.map((item) => {
        return {
          ...item,
          dimmensions: this.getDimmensions(item.id),
          displaySize: this.formatFileSize(item.size),
        };
      });
    }
  }

  trackByFileId(index: number, file: IFileFullDetails): number {
    return file.id;
  }

  formatFileSize(bytes: number) {
    const units = ['B', 'kB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size.toFixed(2)} ${units[i]}`;
  }

  getDimmensions(id: number): string {
    const file = this.files.find((item) => item.id === id);
    if (!file) {
      return '';
    }

    if (isPdf(file)) {
      return `${file.width}x${file.height}mm`;
    } else if (isImage(file)) {
      return `${file.width}x${file.height}px`;
    }

    return '';
  }

  canDelete(file: IFileFullDetails): boolean {
    if (this.who === 'user') {
      return false;
    } else {
      return file.dir === 'inspirations' ? false : true;
    }
  }

  allSelected = false;

  toggleAllFiles(checked: boolean) {
    if (checked) {
      this.selectedFiles = [...this.files];
    } else {
      this.selectedFiles = [];
    }
  }
}
