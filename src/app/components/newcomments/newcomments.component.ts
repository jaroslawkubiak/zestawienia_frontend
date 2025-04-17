import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommentsComponent } from '../comments/comments.component';
import { IComment } from '../comments/types/IComment';
import { EditSetService } from '../sets/edit-set/edit-set.service';
import { IPosition } from '../sets/types/IPosition';
import { ISet } from '../sets/types/ISet';
import { TooltipModule } from 'primeng/tooltip';

interface IPositionsWithComments {
  position: IPosition;
  comments: IComment[];
}

@Component({
  selector: 'app-newcomments',
  imports: [CommonModule, CommentsComponent, TooltipModule],
  templateUrl: './newcomments.component.html',
  styleUrl: './newcomments.component.css',
})
export class NewcommentsComponent implements OnInit {
  setId!: number;
  set!: ISet;
  comments: IComment[] = [];
  positionsWithComments: IPositionsWithComments[] = [];
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
      this.comments = set?.comments ?? [];

      this.uniquePositionIds = [
        ...new Set(this.comments.map((comment) => comment.positionId.id)),
      ];

      this.positionsWithComments = this.uniquePositionIds
        .map((positionId) => {
          const position = positions.find((p) => p.id === positionId);
          if (!position) return null;

          const relatedComments = this.comments.filter(
            (comment) => comment.positionId.id === positionId
          );

          return {
            position,
            comments: relatedComments,
          };
        })
        .filter((item): item is IPositionsWithComments => item !== null);
    });
  }

  back() {
    this.router.navigate([this.backPath]);
  }
}
