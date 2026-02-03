import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { Dialog } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationService } from '../../../../services/notification.service';
import { calcCommentsBadgeSeverity } from '../../../../shared/helpers/calcCommentsBadgeSeverity';
import { calcCommentsBadgeTooltip } from '../../../../shared/helpers/calcCommentsBadgeTooltip';
import { countCommentsBadgeValue } from '../../../../shared/helpers/countCommentsBadgeValue';
import { CommentsComponent } from '../../../comments/comments.component';
import { CommentsService } from '../../../comments/comments.service';
import { IComment } from '../../../comments/types/IComment';
import { BadgeSeverity } from '../../../sets/action-btns/types/badgeSeverity.type';
import { IPosition } from '../../../sets/positions-table/types/IPosition';
import { IPositionStatus } from '../../../sets/positions-table/types/IPositionStatus';
import { ISet } from '../../../sets/types/ISet';

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
export class ProductComponent implements OnInit {
  @Input() set!: ISet;
  @Input() position!: IPosition;
  @Output() commentsUpdated = new EventEmitter<IComment[]>();
  commentsForPosition: IComment[] = [];
  positionId!: number;
  setId!: number;
  showCommentsDialog = false;
  header = '';
  isMobile = window.innerWidth < 768;

  constructor(
    private commentsService: CommentsService,
    private notificationService: NotificationService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.setId = this.set.id;
  }

  showComments(positionId: number) {
    this.positionId = positionId;

    this.commentsService.getCommentsForPosition(positionId).subscribe({
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

  getCommentsBadgeSeverity(): BadgeSeverity {
    return calcCommentsBadgeSeverity(this.position.newCommentsCount);
  }

  getCommentsBadgeValue(): number {
    return countCommentsBadgeValue(this.position.newCommentsCount);
  }

  getCommentsTooltipInfo(): string {
    return calcCommentsBadgeTooltip(this.position.newCommentsCount);
  }
}
