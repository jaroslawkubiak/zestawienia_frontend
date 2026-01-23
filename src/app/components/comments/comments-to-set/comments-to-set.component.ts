import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { countNewComments } from '../../../shared/helpers/countNewComments';
import { EditSetService } from '../../sets/edit-set/edit-set.service';
import { IPosition } from '../../sets/types/IPosition';
import { ISet } from '../../sets/types/ISet';
import { CommentsComponent } from '../comments.component';
import { IComment } from '../types/IComment';

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
  setId!: number;
  set!: ISet;
  comments: IComment[] = [];
  positions: IPosition[] = [];
  positionsWithComments$ = new BehaviorSubject<IPositionsWithComments[]>([]);
  uniquePositionIds: number[] = [];
  backPath: string = '';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private editSetService: EditSetService
  ) {}

  ngOnInit() {
    this.backPath = history.state.backPath;
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
      this.positions = positions;
      this.comments = set?.comments ?? [];

      this.uniquePositionIds = [
        ...new Set(this.comments.map((comment) => comment.positionId.id)),
      ];
      this.updateCommentsList();
    });
  }

  updateCommentsList() {
    const positionsWithComments = this.uniquePositionIds
      .map((positionId) => {
        const position = this.positions.find((p) => p.id === positionId);
        if (!position) return null;

        const relatedComments = this.comments.filter(
          (comment) => comment.positionId.id === positionId
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

  back() {
    this.router.navigate([this.backPath]);
  }
}
