import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-pdf-thumbnail',
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './pdf-thumbnail.component.html',
})
export class PdfThumbnailComponent implements OnInit {
  @Input() pdfUrl: string = '';
  thumbnail: string = '';
  isLoading: boolean = true;

  ngOnInit(): void {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdfjs/pdf.worker.min.mjs';

    this.generateThumbnail();
  }

  generateThumbnail() {
    const loadingTask = pdfjsLib.getDocument(this.pdfUrl);
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
