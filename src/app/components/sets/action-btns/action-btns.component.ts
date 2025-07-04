import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IPosition } from '../types/IPosition';

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

  triggerAddEmptyPosition() {
    this.addEmptyPosition.emit(this.kolejnosc);
  }

  triggerClonePosition() {
    this.clonePosition.emit(this.positionId);
  }

  triggerDeletePosition() {
    this.deletePosition.emit(this.positionId);
  }

  getRowNewComments(positionId: number): number {
    const position = this.positions.find((item) => item.id === positionId);

    return position?.newComments || 0;
  }

  getRowAllComments(positionId: number): number {
    const position = this.positions.find((item) => item.id === positionId);

    return position?.comments?.length || 0;
  }

  triggerShowComments() {
    this.showComments.emit(this.positionId);
  }
}
