import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
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
    LoadingSpinnerComponent,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class FilePreviewComponent {
  @Input() file!: IFileFullDetails;
  @Input() who!: TAuthorType;
  @Input() files: IFileFullDetails[] = [];
  @Output() delete = new EventEmitter<void>();
  @Output() addFileToSelected = new EventEmitter<IFileFullDetails>();
  @Output() download = new EventEmitter<void>();
  @Output() openPdf = new EventEmitter<IFileFullDetails>();
  @Output() openGalery = new EventEmitter<IFileFullDetails>();
  @Output() fileVisible = new EventEmitter<number>();
  @ViewChild('fileElement') fileElement!: ElementRef;
  private observer!: IntersectionObserver;
  isLoading: boolean = true;

  ngAfterViewInit() {
    if (this.file.seenAt) return;
    // observer for files in user screen
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && this.who === 'client') {
            this.fileVisible.emit(this.file.id);
            this.observer.disconnect();
          }
        });
      },
      { threshold: 1 },
    );

    this.observer.observe(this.fileElement.nativeElement);
  }

  onImageLoad() {
    this.isLoading = false;
  }

  onImageError() {
    this.isLoading = false;
  }

  countSelectedFiles(): number {
    return this.files.reduce((acc, file) => {
      return acc + (file.isSelected === true ? 1 : 0);
    }, 0);
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
