import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IPosition } from '../positions-table/types/IPosition';
import { BadgeSeverity } from './types/badgeSeverity.type';

@Component({
  selector: 'app-action-btns',
  imports: [ButtonModule, BadgeModule, TooltipModule],
  templateUrl: './action-btns.component.html',
  styleUrl: './action-btns.component.css',
})
export class ActionBtnsComponent {
  @Input() positions!: IPosition[];
  @Input() positionId: number = 0;
  @Input() kolejnosc: number = 0;
  @Output() addEmptyPosition = new EventEmitter<number>();
  @Output() clonePosition = new EventEmitter<number>();
  @Output() deletePosition = new EventEmitter<number>();
  @Output() showComments = new EventEmitter<number>();
  pTooltipInfo = '';

  getCommentsBadgeValue(positionId: number): number {
    const currentPostition = this.positions.find(
      (pos) => pos.id === positionId,
    );

    if (!currentPostition) {
      return 0;
    }

    const { needsAttention, unread, all } = currentPostition.newCommentsCount;

    this.pTooltipInfo =
      needsAttention > 0 || unread > 0
        ? 'Ilość nowych komentarzy'
        : 'Ilość komentarzy';

    return needsAttention > 0 ? needsAttention : unread > 0 ? unread : all;
  }

  getCommentsBadgeClass(positionId: number): BadgeSeverity {
    const currentPostition = this.positions.find(
      (pos) => pos.id === positionId,
    );

    if (!currentPostition) {
      return 'secondary';
    }
    const { needsAttention, unread, all } = currentPostition.newCommentsCount;

    if (needsAttention > 0 || unread > 0) {
      return 'danger';
    } else if (all > 0) {
      return 'contrast';
    } else {
      return 'secondary';
    }
  }

  triggerAddEmptyPosition() {
    this.addEmptyPosition.emit(this.kolejnosc);
  }

  triggerClonePosition() {
    this.clonePosition.emit(this.positionId);
  }

  triggerDeletePosition() {
    this.deletePosition.emit(this.positionId);
  }

  triggerShowComments() {
    this.showComments.emit(this.positionId);
  }
}
