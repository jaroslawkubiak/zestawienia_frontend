import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { Dialog } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { CommentsComponent } from '../../../comments/comments.component';
import { IComment } from '../../../comments/types/IComment';
import { IPositionWithComments } from '../../../comments/types/IPositionWithComments';
import { IPositionStatus } from '../../../sets/types/IPositionStatus';
import { IPositionWithBadge } from '../../../sets/types/IPositionWithBadge';
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
export class ProductComponent {
  @Input() position!: IPositionWithBadge;
  @Input() index!: number;
  @Input() positionsWithBadge: IPositionWithBadge[] = [];
  @Input() comments: IComment[] = [];
  @Input() set!: ISet;
  @Input() countNewComments!: (comments: IComment[]) => number;
  positionId!: number;
  setId!: number;
  showCommentsDialog = false;
  header = '';
  isMobile = window.innerWidth < 768;

  ngOnInit() {
    this.setId = this.set.id;
  }

  showComments(positionId: number) {
    const position = this.positionsWithBadge.find((p) => p.id === positionId);
    if (!position) return;

    this.comments = position.comments ?? [];
    this.positionId = position.id;
    this.header = `Pozycja ${position.kolejnosc}`;
    this.showCommentsDialog = true;
  }

  onUpdateComments(updatedData: IPositionWithComments) {
    this.positionsWithBadge = this.positionsWithBadge.map((item) =>
      item.id === updatedData.positionId
        ? {
            ...item,
            comments: updatedData.comments,
            newComments: this.countNewComments(updatedData.comments),
          }
        : item,
    );
  }

  getStatusLabel(status: IPositionStatus | string): string {
    return typeof status === 'object' ? status.label : '';
  }

  getStatusCss(status: IPositionStatus | string): string {
    return typeof status === 'object' ? status.cssClass : '';
  }
}
