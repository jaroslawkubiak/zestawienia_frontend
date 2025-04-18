import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PdfThumbnailComponent } from '../pdf-thumbnail/pdf-thumbnail.component';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.css'],
  imports: [
    CommonModule,
    TooltipModule,
    ImageModule,
    ButtonModule,
    PdfThumbnailComponent,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class FilePreviewComponent {
  @Input() file: any;
  @Input() canDelete = false;

  @Output() delete = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
  @Output() openPdf = new EventEmitter<string>();

  get isImage(): boolean {
    return ['JPG', 'JPEG', 'PNG'].includes(this.file?.extension?.toUpperCase());
  }

  get isPdf(): boolean {
    return this.file?.extension?.toUpperCase() === 'PDF';
  }

  get iconData() {
    const ext: string = this.file?.extension?.toUpperCase() ?? '';
    const map: Record<string, { icon: string; tooltip: string }> = {
      JPG: { icon: 'pi pi-image', tooltip: 'Obraz JPG' },
      JPEG: { icon: 'pi pi-image', tooltip: 'Obraz JPEG' },
      PNG: { icon: 'pi pi-image', tooltip: 'Obraz PNG' },
      PDF: { icon: 'pi pi-file-pdf', tooltip: 'Plik PDF' },
      TXT: { icon: 'pi pi-file', tooltip: 'Plik TXT' },
      DOCX: { icon: 'pi pi-file-word', tooltip: 'Dokument Word' },
      XLSX: { icon: 'pi pi-file-excel', tooltip: 'Arkusz Excel' },
    };
    return (
      map[ext] ?? {
        icon: 'pi pi-question-circle',
        tooltip: 'Nieznany typ pliku',
      }
    );
  }
}
