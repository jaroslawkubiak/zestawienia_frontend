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
import { CommentsComponent } from '../../../comments/comments.component';
import { CommentsService } from '../../../comments/comments.service';
import { IComment } from '../../../comments/types/IComment';
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

  getStatusLabel(status: IPositionStatus | string): string {
    return typeof status === 'object' ? status.label : '';
  }

  getStatusCss(status: IPositionStatus | string): string {
    return typeof status === 'object' ? status.cssClass : '';
  }

  onDialogClosed() {
    this.commentsUpdated.emit();
  }

  // calc comments badge color
  getCommentsBadgeClass(): 'danger' | 'contrast' | 'secondary' | 'warn' {
    const { needsAttention, unread, all } = this.position.newCommentsCount;

    if (needsAttention > 0 || unread > 0) {
      return 'danger';
    } else if (all > 0) {
      return 'contrast';
    } else {
      return 'secondary';
    }
  }

  // calc comments badge value
  getCommentsBadgeValue(): number {
    const { needsAttention, unread, all } = this.position.newCommentsCount;

    if (needsAttention > 0 && unread > 0) {
      return needsAttention + unread;
    }

    return needsAttention > 0 ? needsAttention : unread > 0 ? unread : all;
  }

  getCommentsTooltipInfo(): string {
    const { needsAttention, unread } = this.position.newCommentsCount;

    return needsAttention > 0 || unread > 0
      ? 'Ilość nowych komentarzy'
      : 'Ilość komentarzy';
  }
}
