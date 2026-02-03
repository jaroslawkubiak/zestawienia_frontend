import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { IFileFullDetails } from '../types/IFileFullDetails';

@Component({
  selector: 'app-pdf-thumbnail',
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './pdf-thumbnail.component.html',
  styleUrl: './pdf-thumbnail.component.css',
})
export class PdfThumbnailComponent implements OnChanges {
  @Input() file!: IFileFullDetails;
  @Output() pdfClick = new EventEmitter<IFileFullDetails>();

  constructor(private cd: ChangeDetectorRef) {}
  handleClick() {
    this.pdfClick.emit(this.file);
  }
  
  thumbnail: string = '';
  isLoading: boolean = true;

  ngOnChanges(): void {
    if (this.file?.thumbnail) {
      this.thumbnail = this.file.thumbnail;
      this.isLoading = false;
    } else {
      this.thumbnail = '';
      this.isLoading = false;
    }
  }
}
