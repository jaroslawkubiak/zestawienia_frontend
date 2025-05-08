import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { PdfThumbnailComponent } from '../../pdf-thumbnail/pdf-thumbnail.component';
import { IFileFullDetails } from '../../types/IFileFullDetails';
import { IsImagePipe } from '../../pipe/is-image.pipe';
import { IsPdfPipe } from '../../pipe/is-pdf.pipe';

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
export class ListViewComponent {
  selectedFiles!: any;
  @Input() who!: string;
  @Input() files: IFileFullDetails[] = [];
  @Output() downloadFile = new EventEmitter<number>();
  @Output() deleteFile = new EventEmitter<number>();
  @Output() openPdf = new EventEmitter<IFileFullDetails>();

  formatFileSize(bytes: number) {
    const units = ['B', 'kB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size.toFixed(2)} ${units[i]}`;
  }
}
