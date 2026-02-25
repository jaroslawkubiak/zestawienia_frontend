import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { environment } from '../../../../environments/environment';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { IFileFullDetails } from '../types/IFileFullDetails';

@Component({
  selector: 'app-pdf-thumbnail',
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './pdf-thumbnail.component.html',
  styleUrl: './pdf-thumbnail.component.css',
})
export class PdfThumbnailComponent implements OnInit {
  @Input() file!: IFileFullDetails;
  @Output() pdfClick = new EventEmitter<IFileFullDetails>();

  constructor(private cd: ChangeDetectorRef) {}
  handleClick() {
    this.pdfClick.emit(this.file);
  }

  thumbnail: string = '';
  isLoading: boolean = true;

  ngOnInit(): void {
    // forces pdf worker to load .js
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.js';

    if (this.file?.thumbnailPath) {
      this.thumbnail = this.file.thumbnailPath;
      this.isLoading = false;
    } else {
      this.generatePdfThumbnail(this.file);
    }
  }

  private generatePdfThumbnail(file: IFileFullDetails) {
    const fullPath = `${environment.FILES_URL}/${file.path}/${file.fileName}`;

    pdfjsLib
      .getDocument(fullPath)
      .promise.then((pdf: any) => {
        pdf
          .getPage(1)
          .then((page: any) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const viewport = page.getViewport({ scale: 0.3 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            return page
              .render({
                canvasContext: context,
                viewport: viewport,
              })
              .promise.then(() => canvas.toDataURL());
          })
          .then((thumbnail: string) => {
            this.thumbnail = thumbnail;
            this.isLoading = false;

            this.cd.detectChanges();
          })
          .catch((error: any) => {
            this.isLoading = false;
            // Silently skip PDF thumbnail if it fails
            console.debug(
              `Could not generate PDF thumbnail for: ${file.fileName}`,
            );
          });
      })
      .catch((error: any) => {
        this.isLoading = false;
        // Silently skip PDF thumbnail if it fails
        console.debug(`Could not load PDF for: ${file.fileName}`);
      });
  }

  onImageLoad() {
    this.isLoading = false;
    this.cd.markForCheck();
  }

  onImageError() {
    this.isLoading = false;
    this.thumbnail = '';
  }
}
