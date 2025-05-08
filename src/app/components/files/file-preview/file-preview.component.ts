import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { TooltipModule } from 'primeng/tooltip';
import { PdfThumbnailComponent } from '../pdf-thumbnail/pdf-thumbnail.component';
import { IsImagePipe } from '../pipe/is-image.pipe';
import { IsPdfPipe } from '../pipe/is-pdf.pipe';
import { IFileFullDetails } from '../types/IFileFullDetails';

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
    IsImagePipe,
    IsPdfPipe,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class FilePreviewComponent {
  @Input() file!: IFileFullDetails;
  @Input() canDelete = false;
  @Output() delete = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
  @Output() openPdf = new EventEmitter<IFileFullDetails>();

  get iconData() {
    const ext: string = this.file?.type?.toUpperCase() ?? '';
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
