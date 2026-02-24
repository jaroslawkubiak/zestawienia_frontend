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
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { LoadingSpinnerComponent } from '../../../../shared/loading-spinner/loading-spinner.component';
import { TAuthorType } from '../../../comments/types/authorType.type';
import { PdfThumbnailComponent } from '../../pdf-thumbnail/pdf-thumbnail.component';
import { IsImagePipe } from '../../pipe/is-image.pipe';
import { IsPdfPipe } from '../../pipe/is-pdf.pipe';
import { IFileFullDetails } from '../../types/IFileFullDetails';

@Component({
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.css'],
  imports: [
    CommonModule,
    TooltipModule,
    ButtonModule,
    PdfThumbnailComponent,
    IsImagePipe,
    IsPdfPipe,
    CheckboxModule,
    FormsModule,
    LoadingSpinnerComponent
  ],
  encapsulation: ViewEncapsulation.None,
})
export class FilePreviewComponent {
  @Input() file!: IFileFullDetails;
  @Input() who!: TAuthorType;
  @Input() selectedFiles: IFileFullDetails[] = [];
  @Output() delete = new EventEmitter<void>();
  @Output() addFileToSelected = new EventEmitter<IFileFullDetails>();
  @Output() download = new EventEmitter<void>();
  @Output() openPdf = new EventEmitter<IFileFullDetails>();
  @Output() openGalery = new EventEmitter<IFileFullDetails>();

  isLoading: boolean = true;
  onImageLoad() {
    this.isLoading = false;
  }

  onImageError() {
    this.isLoading = false;
  }

  get isSelected(): boolean {
    return this.selectedFiles.some((f) => f.id === this.file.id);
  }

  getImageOrientation(file: IFileFullDetails): 'portrait' | 'landscape' {
    return file.height > file.width ? 'portrait' : 'landscape';
  }

  onShowImageClick(event: MouseEvent, file: IFileFullDetails) {
    event.stopPropagation();
    event.preventDefault();
    this.openGalery.emit(file);
  }
}
