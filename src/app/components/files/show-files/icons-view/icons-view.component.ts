import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { TAuthorType } from '../../../comments/types/authorType.type';
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
    BadgeModule,
  ],
  templateUrl: './icons-view.component.html',
  styleUrl: './icons-view.component.css',
})
export class IconsViewComponent {
  @Input() who!: TAuthorType;
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

  dirListWithShowOption: { dirName: string; show: boolean }[] = [];

  ngOnInit() {
    this.sortedFiles = [...this.files];
    this.sortedFiles.sort((a, b) => a.dir.localeCompare(b.dir));

    this.dirListWithShowOption = this.uniqueDir.map((dir) => ({
      dirName: dir,
      show: true,
    }));
  }

  filesFilteredByDir(dir: string): IFileFullDetails[] {
    return this.files.filter((file) => file.dir === dir);
  }

  toggleVisibility(dirName: string): void {
    const dir = this.dirListWithShowOption.find((d) => d.dirName === dirName);
    if (dir) {
      dir.show = !dir.show;
    }
  }

  trackByDir(_: number, item: { dirName: string; show: boolean }): string {
    return item.dirName;
  }

  countFilesBadge(dirName: string) {
    const filesCount = this.files.filter((file) => file.dir === dirName);
    return filesCount.length;
  }
}
