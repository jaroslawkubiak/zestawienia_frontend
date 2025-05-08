import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FilePreviewComponent } from '../../file-preview/file-preview.component';
import { IFileFullDetails } from '../../types/IFileFullDetails';

@Component({
  selector: 'app-icons-view',
  imports: [FilePreviewComponent, CommonModule],
  templateUrl: './icons-view.component.html',
  styleUrl: './icons-view.component.css',
})
export class IconsViewComponent {
  @Input() who!: string;
  @Input() files: IFileFullDetails[] = [];
  @Input() deleteFile!: (id: number) => void;
  @Input() downloadFile!: (id: number) => void;
  @Input() openPdf!: (file: IFileFullDetails) => void;
}
