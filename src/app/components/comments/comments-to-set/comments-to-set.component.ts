import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from '../../../../environments/environment';
import { IPosition } from '../../sets/positions-table/types/IPosition';
import { ISet } from '../../sets/types/ISet';
import { CommentsComponent } from '../comments.component';
import { IPositionWithComments } from '../types/IPositionWithComments';

@Component({
  selector: 'app-comments-to-set',
  imports: [CommonModule, CommentsComponent, TooltipModule, RouterModule],
  templateUrl: './comments-to-set.component.html',
  styleUrl: './comments-to-set.component.css',
})
export class CommentsToSetComponent {
  FILES_URL = environment.FILES_URL;
  @Input() set!: ISet;
  @Input() positionsWithComments: IPositionWithComments[] = [];

  getImagePreviewUrl(position: IPosition): string {
    const fileName = position['image'];

    if (!fileName) {
      return '';
    }

    return `${this.FILES_URL}/sets/${this.set.id}/${this.set.hash}/positions/${position.id}/${fileName}`;
  }
}
