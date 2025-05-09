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

@Component({
  selector: 'app-list-view',
  imports: [
    TableModule,
    FormsModule,
    CommonModule,
    TooltipModule,
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
  selectedFiles: IFileFullDetails[] = [];
  @Input() who!: string;
  @Input() files: IFileFullDetails[] = [];
  @Output() downloadFile = new EventEmitter<number>();
  @Output() deleteFile = new EventEmitter<number>();
  @Output() deleteFiles = new EventEmitter<number[]>();
  @Output() openPdf = new EventEmitter<IFileFullDetails>();

  ngOnChanges(changes: SimpleChanges): void {
    this.selectedFiles = [];
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

  deleteSelectedFiles() {
    const ids: number[] = this.selectedFiles.map((item) => item.id);
    this.deleteFiles.emit(ids);
  }
}
