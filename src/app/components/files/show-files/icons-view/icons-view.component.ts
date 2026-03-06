import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { TAuthorType } from '../../../comments/types/authorType.type';
import { ImageGalleryComponent } from '../../../image-gallery/image-gallery.component';
import { IGalleryList } from '../../../image-gallery/types/IGalleryList';
import { EFileDirectory } from '../../types/file-directory.enum';
import { IDirWithShowOptions } from '../../types/IDirWithShowOptions';
import { IFileFullDetails } from '../../types/IFileFullDetails';
import { ISelectFilesFromDirectoryEvent } from '../../types/ISelectFilesFromDirectoryEvent';
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
    ImageGalleryComponent,
  ],
  templateUrl: './icons-view.component.html',
  styleUrl: './icons-view.component.css',
})
export class IconsViewComponent implements OnChanges {
  @Input() who!: TAuthorType;
  @Input() files: IFileFullDetails[] = [];
  @Input() selectedFiles: IFileFullDetails[] = [];
  @Input() uniqueDir: { dir: EFileDirectory; dirLabel: string }[] = [];
  @Input() deleteFile!: (id: number) => void;
  @Input() downloadFile!: (id: number) => void;
  @Input() openPdf!: (file: IFileFullDetails) => void;
  @Input() addFileToSelected!: (file: IFileFullDetails) => void;
  @Input() isMobile!: boolean;

  @Output() fileVisible = new EventEmitter<number>();
  @Output() selectFilesFromDirectory =
    new EventEmitter<ISelectFilesFromDirectoryEvent>();
  @ViewChild('imageGallery') imageGallery!: ImageGalleryComponent;
  sortedFiles: IFileFullDetails[] = [];
  dirListWithShowOption: IDirWithShowOptions[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['files']) {
      this.sortedFiles = [...this.files];
      this.sortedFiles.sort((a, b) => a.dir.localeCompare(b.dir));
    }

    if (changes['uniqueDir']) {
      this.dirListWithShowOption = this.uniqueDir.map((dir) => ({
        ...dir,
        show: true,
      }));
    }
  }

  onDirectoryCheckboxChange(directory: IDirWithShowOptions, event: any) {
    this.selectFilesFromDirectory.emit({
      directory,
      checked: event.checked,
    });
  }

  isDirectoryChecked(dir: string): boolean {
    const files = this.files.filter((f) => f.dir === dir);

    if (files.length === 0) return false;

    return files.every((file) =>
      this.selectedFiles.some((selected) => selected.id === file.id),
    );
  }

  isDirectoryIndeterminate(dir: string): boolean {
    const files = this.files.filter((f) => f.dir === dir);

    const selectedCount = files.filter((file) =>
      this.selectedFiles.some((selected) => selected.id === file.id),
    ).length;

    return selectedCount > 0 && selectedCount < files.length;
  }

  filesFilteredByDir(dir: string): IFileFullDetails[] {
    return this.files.filter((file) => file.dir === dir);
  }

  toggleVisibility(dirName: string): void {
    const dir = this.dirListWithShowOption.find((d) => d.dir === dirName);
    if (dir) {
      dir.show = !dir.show;
    }
  }

  trackByDir(_: number, item: IDirWithShowOptions): string {
    return item.dir;
  }

  countFilesBadge(dirName: string) {
    const filesCount = this.files.filter((file) => file.dir === dirName);
    return filesCount.length;
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
