import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { calcCommentsBadgeSeverity } from '../../../../shared/helpers/calcCommentsBadgeSeverity';
import { calcCommentsBadgeTooltip } from '../../../../shared/helpers/calcCommentsBadgeTooltip';
import { countCommentsBadgeValue } from '../../../../shared/helpers/countCommentsBadgeValue';
import { LoadingSpinnerComponent } from '../../../../shared/loading-spinner/loading-spinner.component';
import { TAuthorType } from '../../../comments/types/authorType.type';
import { TBadgeSeverity } from '../../../settings/types/badgeSeverity.type';
import { PdfThumbnailComponent } from '../../pdf-thumbnail/pdf-thumbnail.component';
import { IsImagePipe } from '../../pipe/is-image.pipe';
import { IsPdfPipe } from '../../pipe/is-pdf.pipe';
import { IFileFullDetails } from '../../types/IFileFullDetails';

@Component({
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.css'],
  imports: [
    CommonModule,
    TooltipModule,
    ButtonModule,
    BadgeModule,
    PdfThumbnailComponent,
    IsImagePipe,
    IsPdfPipe,
    CheckboxModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class FilePreviewComponent {
  @Input() who!: TAuthorType;
  @Input() isMobile: boolean = false;
  @Input() file!: IFileFullDetails;
  @Input() files: IFileFullDetails[] = [];
  @Input() selectedFiles: IFileFullDetails[] = [];

  @Output() addFileToSelected = new EventEmitter<IFileFullDetails>();
  @Output() delete = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
  @Output() openPdf = new EventEmitter<IFileFullDetails>();
  @Output() openGalery = new EventEmitter<IFileFullDetails>();
  @Output() fileVisible = new EventEmitter<number>();
  @Output() showComments = new EventEmitter<number>();
  @ViewChild('fileElement') fileElement!: ElementRef;
  private observer!: IntersectionObserver;
  isLoading: boolean = true;

  ngAfterViewInit() {
    if (this.file.seenAt) return;
    // observer for files in user screen
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && this.who === 'client') {
            this.fileVisible.emit(this.file.id);
            this.observer.disconnect();
          }
        });
      },
      { threshold: 1 },
    );

    this.observer.observe(this.fileElement.nativeElement);
  }

  onImageLoad() {
    this.isLoading = false;
  }

  onImageError() {
    this.isLoading = false;
  }

  get isSelected(): boolean {
    return this.selectedFiles.some((f) => f.id === this.file.id);
  }

  getImageOrientation(file: IFileFullDetails): 'portrait' | 'landscape' {
    return file.height > file.width ? 'portrait' : 'landscape';
  }

  onShowImageClick(event: MouseEvent, file: IFileFullDetails) {
    event.stopPropagation();
    event.preventDefault();
    this.openGalery.emit(file);
  }

  triggerShowComments(fileId: number) {
    this.showComments.emit(fileId);
  }

  getCommentsBadgeSeverity(): TBadgeSeverity {
    const unread = this.file.newCommentsCount;
    if (!unread) return 'contrast';

    return calcCommentsBadgeSeverity(unread);
  }

  getCommentsBadgeValue(): number {
    const unread = this.file.newCommentsCount;
    if (!unread) return 0;

    return countCommentsBadgeValue(unread);
  }
  getCommentsTooltip(): string {
    const unread = this.file.newCommentsCount;
    if (!unread) return '';

    return calcCommentsBadgeTooltip(unread);
  }

  getCommentsBtnText(): string {
    return this.getCommentsBadgeValue() !== 0
      ? 'Pokaż komentarze'
      : 'Dodaj komentarz';
  }
}
