import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { CommentsComponent } from '../../comments/comments.component';
import { IComment } from '../../comments/types/IComment';
import { IPosition } from '../types/IPosition';
import { ISet } from '../types/ISet';

@Component({
  selector: 'app-action-btns',
  imports: [
    ButtonModule,
    BadgeModule,
    TooltipModule,
    Dialog,
    CommentsComponent,
  ],
  templateUrl: './action-btns.component.html',
  styleUrl: './action-btns.component.css',
})
export class ActionBtnsComponent {
  showCommentsDialog = false;
  comments: IComment[] = [];
  header = '';
  @Input() positions!: IPosition[];
  @Input() setId: number = 0;
  @Input() positionId: number = 0;
  @Input() kolejnosc: number = 0;
  @Output() addEmptyPosition = new EventEmitter<number>();
  @Output() clonePosition = new EventEmitter<number>();
  @Output() deletePosition = new EventEmitter<number>();
  @Output() updateComments = new EventEmitter<any>();

  showComments(positionId: number) {
    const position = this.positions.find((item) => item.id === positionId);

    if (position?.comments) {
      this.comments = position.comments;
      this.header = `Pozycja ${position.kolejnosc} ${
        position.produkt ? ' : ' + position.produkt : ''
      }`;
      this.showCommentsDialog = true;
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

  getRowNewComments(positionId: number): number {
    const position = this.positions.find((item) => item.id === positionId);

    return position?.newComments || 0;
  }

  getRowAllComments(positionId: number): number {
    const position = this.positions.find((item) => item.id === positionId);

    return position?.comments?.length || 0;
  }

  onUpdateComments(res: any) {
    this.positions = this.positions.map((item) => {
      if (item.id === res.posId) {
        const newCommentsCount = res.comments.filter(
          (c: IComment) => !c.readByReceiver && c.authorType !== 'user'
        ).length;

        const response = {
          ...item,
          comments: res.comments,
          newComments: newCommentsCount,
        };

        this.updateComments.emit(response);
        return response;
      }

      return { ...item };
    });
  }
}
