import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../login/auth.service';
import { IBookmark } from '../../bookmarks/IBookmark';
import { ISet } from '../ISet';
import { IPosition } from '../position/IPosition';
import { PositionComponent } from '../position/position.component';
import { SetsService } from '../sets.service';

@Component({
  selector: 'app-set',
  templateUrl: './set.component.html',
  styleUrl: './set.component.css',
  standalone: true,
  providers: [MessageService],
  imports: [ToastModule, TabsModule, CommonModule, PositionComponent],
})
export class SetComponent implements OnInit {
  private authorizationToken: string | null;
  setId!: string;
  set!: ISet;
  positions: IPosition[] = [];
  positionsFromBookmark: IPosition[] = [];
  bookmarks: IBookmark[] = [];
  selectedBookmark: number = 0;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private setsService: SetsService
  ) {
    this.authorizationToken = this.authService.authorizationToken;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.setId = params.get('id') || '';
      if (this.setId) {
        this.getPosition();
        this.getSet();
      }
    });
  }

  getSet(): void {
    if (this.authorizationToken) {
      this.setsService.getSet(this.authorizationToken, this.setId).subscribe({
        next: (data) => {
          this.set = data[0];
          this.bookmarks = this.set.bookmarks;
          this.selectedBookmark = Math.min(
            ...this.bookmarks.map((item) => item.id)
          );
          this.loadContent(this.selectedBookmark);
        },
        error: (err) => console.error('Error getting set ', err),
      });
    }
  }

  getPosition(): void {
    if (this.authorizationToken) {
      this.setsService
        .getPositions(this.authorizationToken, this.setId)
        .subscribe({
          next: (data) => (this.positions = data),
          error: (err) => console.error('Error getting positions ', err),
        });
    }
  }

  loadContent(bookmarkId: number) {
    this.selectedBookmark = bookmarkId;
    this.positionsFromBookmark = this.positions.filter(
      (item) => item.bookmarkId.id === this.selectedBookmark
    );
  }
}
