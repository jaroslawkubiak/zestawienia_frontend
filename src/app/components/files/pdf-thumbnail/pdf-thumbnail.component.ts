import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { IFileFullDetails } from '../types/IFileFullDetails';
import { environment } from '../../../../environments/environment';
import { PdfCacheService } from './pdf-cache.service';

@Component({
  selector: 'app-pdf-thumbnail',
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './pdf-thumbnail.component.html',
  styleUrl: './pdf-thumbnail.component.css',
})
export class PdfThumbnailComponent implements OnInit {
  @Input() file!: IFileFullDetails;
  @Output() pdfClick = new EventEmitter<IFileFullDetails>();

  constructor(private pdfCacheService: PdfCacheService) {}
  handleClick() {
    this.pdfClick.emit(this.file);
  }
  thumbnail: string = '';
  isLoading: boolean = true;

  ngOnInit(): void {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdfjs/pdf.worker.min.mjs';

    const cached = this.pdfCacheService.get(this.file.id);
    if (cached) {
      this.thumbnail = cached;
      this.isLoading = false;
      return;
    }

    this.generateThumbnail();
  }

  generateThumbnail() {
    const fullPath = `${environment.FILES_URL}${this.file.path}/${this.file.fileName}`;
    const loadingTask = pdfjsLib.getDocument(fullPath);
    loadingTask.promise
      .then((pdf: any) => {
        pdf.getPage(1).then((page: any) => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (context) {
            const viewport = page.getViewport({ scale: 0.3 });

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            page
              .render({
                canvasContext: context,
                viewport: viewport,
              })
              .promise.then(() => {
                this.thumbnail = canvas.toDataURL();
                this.isLoading = false;
              });
          } else {
            console.error('Brak dostępnego kontekstu 2d dla canvas.');
            this.isLoading = false;
          }
        });
      })
      .catch((error: any) => {
        console.error('Błąd ładowania PDF:', error);
        this.isLoading = false;
      });
  }
}
