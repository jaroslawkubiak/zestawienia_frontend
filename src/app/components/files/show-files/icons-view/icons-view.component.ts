import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { IFileFullDetails } from '../../types/IFileFullDetails';
import { FilePreviewComponent } from '../file-preview/file-preview.component';

@Component({
  selector: 'app-icons-view',
  imports: [
    FilePreviewComponent,
    CommonModule,
    FormsModule,
    ButtonModule,
    TooltipModule,
    CheckboxModule,
  ],
  templateUrl: './icons-view.component.html',
  styleUrl: './icons-view.component.css',
})
export class IconsViewComponent {
  @Input() who!: 'client' | 'user';
  @Input() files: IFileFullDetails[] = [];
  @Input() uniqueDir: string[] = [];
  @Input() selectedFiles: IFileFullDetails[] = [];
  @Input() deleteFile!: (id: number) => void;
  @Input() downloadFile!: (id: number) => void;
  @Input() openPdf!: (file: IFileFullDetails) => void;
  @Input() addFileToSelected!: (file: IFileFullDetails) => void;
  @Input() isDeleteDisabled!: boolean;

  @Output() downloadFiles = new EventEmitter<any>();
  @Output() deleteFiles = new EventEmitter<void>();
  @Output() selectAll = new EventEmitter<any>();
  sortedFiles: IFileFullDetails[] = [];

  ngOnInit() {
    this.sortedFiles = [...this.files];
    this.sortedFiles.sort((a, b) => a.dir.localeCompare(b.dir));
  }

  filesFilteredByDir(dir: string): IFileFullDetails[] {
    return this.files.filter((file) => file.dir === dir);
  }
}
