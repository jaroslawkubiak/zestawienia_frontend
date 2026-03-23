import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { Dialog } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from '../../../../../environments/environment';
import { NotificationService } from '../../../../services/notification.service';
import { calcCommentsBadgeSeverity } from '../../../../shared/helpers/calcCommentsBadgeSeverity';
import { countCommentsBadgeValue } from '../../../../shared/helpers/countCommentsBadgeValue';
import { CommentsComponent } from '../../../comments/comments.component';
import { IComment } from '../../../comments/types/IComment';
import { IPosition } from '../../../sets/positions-table/types/IPosition';
import { ISet } from '../../../sets/types/ISet';
import { TBadgeSeverity } from '../../../settings/types/badgeSeverity.type';
import { ExternalService } from '../../external.service';

@Component({
  selector: 'app-product',
  imports: [
    CommonModule,
    TooltipModule,
    BadgeModule,
    Dialog,
    CommentsComponent,
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent {
  @Input() set!: ISet;
  @Input() position!: IPosition;
  @Input() clientHash!: string;
  @Output() commentsUpdated = new EventEmitter<IComment[]>();
  commentsForPosition: IComment[] = [];
  positionId!: number;
  showCommentsDialog = false;
  header = '';
  isMobile = window.innerWidth < 768;
  FILES_URL = environment.FILES_URL;

  constructor(
    private externalService: ExternalService,
    private notificationService: NotificationService,
    private cd: ChangeDetectorRef,
  ) {}

  showComments(positionId: number) {
    this.positionId = positionId;

    this.externalService
      .getCommentsForPosition(this.set.hash, this.clientHash, positionId)
      .subscribe({
        next: (response) => {
          this.commentsForPosition = response;
          this.header = `Pozycja ${this.position.kolejnosc} ${
            this.position.produkt ? ' : ' + this.position.produkt : ''
          }`;

          this.showCommentsDialog = true;

          this.cd.markForCheck();
        },
        error: (error) => {
          this.notificationService.showNotification('error', error.message);
        },
      });
  }

  onDialogClosed() {
    this.commentsUpdated.emit();
  }

  getImagePreviewUrl(position: IPosition): string {
    const thumbnail = position['thumbnail'];
    const image = position['image'];

    const fileName = thumbnail || image;

    if (!fileName) {
      return '';
    }

    return `${this.FILES_URL}/sets/${this.set.id}/${this.set.hash}/positions/${position.id}/${fileName}`;
  }
  getCommentsBadgeSeverity(): TBadgeSeverity {
    return calcCommentsBadgeSeverity(this.position.newCommentsCount, 'client');
  }

  getCommentsBadgeValue(): number {
    return countCommentsBadgeValue(this.position.newCommentsCount);
  }
}
