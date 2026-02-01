import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  calculateBrutto,
  calculateWartosc,
} from '../../../shared/helpers/calculate';
import { countNewComments } from '../../../shared/helpers/countNewComments';
import { EditSetService } from '../../sets/edit-set/edit-set.service';
import { PositionStatusList } from '../../sets/PositionStatusList';
import { IPositionStatus } from '../../sets/positions-table/types/IPositionStatus';
import { ISet } from '../../sets/types/ISet';
import { CommentsComponent } from '../comments.component';
import { IComment } from '../types/IComment';
import { IPosition } from '../../sets/positions-table/types/IPosition';

interface IPositionsWithComments {
  position: IPosition;
  comments: IComment[];
  newComments: number;
}

@Component({
  selector: 'app-comments-to-set',
  imports: [CommonModule, CommentsComponent, TooltipModule, RouterModule],
  templateUrl: './comments-to-set.component.html',
  styleUrl: './comments-to-set.component.css',
})
export class CommentsToSetComponent implements OnInit {
  FILES_URL = environment.FILES_URL;
  setId!: number;
  set!: ISet;
  comments: IComment[] = [];
  positions: IPosition[] = [];
  positionsWithComments$ = new BehaviorSubject<IPositionsWithComments[]>([]);
  uniquePositionIds: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private editSetService: EditSetService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.setId = Number(params.get('id'));
      if (this.setId) {
        this.loadData();
      }
    });
  }

  loadData() {
    forkJoin({
      set: this.editSetService.getSet(this.setId),
      positions: this.editSetService.getPositions(this.setId),
    }).subscribe(({ set, positions }) => {
      this.set = set;
      this.positions = positions.map((position) => {
        const statusObj: IPositionStatus =
          PositionStatusList.find(
            (statusItem) => position.status === statusItem.label,
          ) || PositionStatusList[0];

        const brutto = calculateBrutto(position.netto);
        const wartoscBrutto = calculateWartosc(position.ilosc, brutto);
        return { ...position, wartoscBrutto, status: statusObj };
      });

      this.comments = set?.comments ?? [];

      this.uniquePositionIds = [
        ...new Set(this.comments.map((comment) => comment.positionId)),
      ];

      this.updateCommentsList();
    });
  }

  getImagePreviewUrl(position: IPosition): string {
    const fileName = position['image'];

    if (!fileName) {
      return '';
    }

    return `${this.FILES_URL}/sets/${this.set.id}/${this.set.hash}/positions/${position.id}/${fileName}`;
  }

  updateCommentsList() {
    const positionsWithComments = this.uniquePositionIds
      .map((positionId) => {
        const position = this.positions.find((p) => p.id === positionId);
        if (!position) return null;

        const relatedComments = this.comments.filter(
          (comment) => comment.positionId === positionId,
        );

        return {
          position,
          comments: relatedComments,
          newComments: countNewComments(relatedComments, 'client'),
        };
      })
      .filter((item): item is IPositionsWithComments => item !== null);

    this.positionsWithComments$.next(positionsWithComments);
  }

  getStatusLabel(status: IPositionStatus | string): string {
    return typeof status === 'object' ? status.label : '';
  }

  getStatusCss(status: IPositionStatus | string): string {
    return typeof status === 'object' ? status.cssClass : '';
  }
}
