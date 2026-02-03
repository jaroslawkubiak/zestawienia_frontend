import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { calcCommentsBadgeSeverity } from '../../../shared/helpers/calcCommentsBadgeSeverity';
import { calcCommentsBadgeTooltip } from '../../../shared/helpers/calcCommentsBadgeTooltip';
import { countCommentsBadgeValue } from '../../../shared/helpers/countCommentsBadgeValue';
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

  getCommentsBadgeValue(positionId: number): number {
    const currentPostition = this.findCurrentPosition(positionId);
    if (!currentPostition?.newCommentsCount) return 0;

    return countCommentsBadgeValue(currentPostition?.newCommentsCount);
  }

  getCommentsBadgeTooltip(positionId: number): string {
    const currentPostition = this.findCurrentPosition(positionId);
    if (!currentPostition?.newCommentsCount) return '';

    return calcCommentsBadgeTooltip(currentPostition.newCommentsCount);
  }

  getCommentsBadgeSeverity(positionId: number): BadgeSeverity {
    const currentPostition = this.findCurrentPosition(positionId);
    if (!currentPostition?.newCommentsCount) return 'secondary';

    return calcCommentsBadgeSeverity(currentPostition.newCommentsCount);
  }

  private findCurrentPosition(positionId: number): IPosition {
    return this.positions.find((pos) => pos.id === positionId)!;
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
