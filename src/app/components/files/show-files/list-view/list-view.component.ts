import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TAuthorType } from '../../../comments/types/authorType.type';
import { ImageGalleryComponent } from '../../../image-gallery/image-gallery.component';
import { IGalleryList } from '../../../image-gallery/types/IGalleryList';
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
    CheckboxModule,
    ButtonModule,
    PdfThumbnailComponent,
    IsImagePipe,
    IsPdfPipe,
    ImageGalleryComponent,
  ],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ListViewComponent implements OnChanges {
  @Input() who!: TAuthorType;
  @Input() files: IFileFullDetails[] = [];
  @Input() selectedFiles: IFileFullDetails[] = [];
  @Input() isDeleteDisabled!: boolean;

  @Output() downloadFile = new EventEmitter<number>();
  @Output() deleteFile = new EventEmitter<number>();
  @Output() deleteFiles = new EventEmitter<void>();
  @Output() clearSelectedFiles = new EventEmitter<void>();
  @Output() openPdf = new EventEmitter<IFileFullDetails>();
  @Output() addFileToSelected = new EventEmitter<IFileFullDetails>();
  @Output() selectAll = new EventEmitter<any>();
  @Output() downloadFiles = new EventEmitter<any>();
  @Output() selectedFilesChange = new EventEmitter<IFileFullDetails[]>();
  @ViewChild('imageGallery') imageGallery!: ImageGalleryComponent;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.files) {
      this.files = this.files.map((item) => {
        return {
          ...item,
          dimmensions: this.getDimmensions(item),
          displaySize: this.formatFileSize(item.size),
        };
      });
    }
  }

  getImageOrientation(file: IFileFullDetails): 'portrait' | 'landscape' {
    return file.height > file.width ? 'portrait' : 'landscape';
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

  getDimmensions(file: IFileFullDetails): string {
    if (isPdf(file)) {
      return `${file.width}x${file.height}mm`;
    }
    if (isImage(file)) {
      return `${file.width}x${file.height}px`;
    }
    return '';
  }

  allSelected = false;

  toggleAllFiles(checked: boolean) {
    if (checked) {
      this.selectedFiles = [...this.files];
    } else {
      this.selectedFiles = [];
    }
  }

  onShowImageClick(event: MouseEvent, file: IFileFullDetails) {
    event.stopPropagation();
    event.preventDefault();
    this.openGalery(file);
  }

  openGalery(file: IFileFullDetails) {
    const clickedImageUrl = file.fullPath;
    if (!clickedImageUrl) return;

    const galleryImages: IGalleryList[] = this.files
      .filter((file) =>
        ['JPG', 'JPEG', 'PNG'].includes(file?.type?.toUpperCase()),
      )
      .map((file) => {
        return {
          itemImageSrc: file.fullPath,
          thumbnailImageSrc: file.fullPath,
        };
      })
      .filter((file) => file !== null) as IGalleryList[];

    const activeIndex = galleryImages.findIndex(
      (img) => img.itemImageSrc === clickedImageUrl,
    );

    this.imageGallery.images = galleryImages;
    this.imageGallery.openGallery(activeIndex);
  }
}
