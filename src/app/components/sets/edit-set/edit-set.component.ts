import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { CanComponentDeactivate } from '../../../guards/unsaved-changes.guard';
import { AuthService } from '../../../login/auth.service';
import { IBookmark } from '../../bookmarks/IBookmark';
import { SetsService } from '../sets.service';
import { IPosition } from '../types/IPosition';
import { ISet } from '../types/ISet';
import { columnList } from './column-list';

// import { ConfirmDialog } from 'primeng/confirmdialog';
// import { notificationLifeTime } from '../../shared/constans';

@Component({
  selector: 'app-set',
  templateUrl: './edit-set.component.html',
  styleUrl: './edit-set.component.css',
  standalone: true,
  providers: [SetsService],
  imports: [
    ToastModule,
    TabsModule,
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    Dialog,
  ],
})
export class EditSetComponent implements OnInit, CanComponentDeactivate {
  private authorizationToken: string | null;
  setId!: string;
  isEdited: boolean = false;
  set!: ISet;
  positions: IPosition[] = [];
  positionsFromBookmark: IPosition[] = [];
  bookmarks: IBookmark[] = [];
  selectedBookmark: number = 0;
  formData: any = {};
  columnList = columnList;

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

  markAsEdited() {
    this.isEdited = true;
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
          next: (data) => {
            this.positions = data;
          },
          error: (err) => console.error('Error getting positions ', err),
        });
    }
  }

  loadContent(bookmarkId: number) {
    console.log(`##### form #####`);
    console.log(this.formData);
    // tutaj musze zapisac wszystkie dane do this.position

    this.selectedBookmark = bookmarkId;
    this.positionsFromBookmark = this.positions.filter(
      (item) => item.bookmarkId.id === this.selectedBookmark
    );
    this.initializeForm();
  }

  initializeForm() {
    this.formData = this.positionsFromBookmark.map((position) => {
      let obj: any = {};
      this.columnList.forEach((column) => {
        obj[column.key] = position[column.key as keyof IPosition];
      });
      return obj;
    });
  }

  save() {
    console.log('Zapisane dane:', this.formData);
    this.isEdited = false;
  }

  showWarningDialog = false;
  pendingNavigation: Function | null = null;

  canDeactivate(): boolean {
    if (this.isEdited) {
      this.showWarningDialog = true;
      return false;
    }
    return true;
  }

  confirmExit(confirm: boolean) {
    if (confirm && this.pendingNavigation) {
      this.pendingNavigation();
    }
    this.showWarningDialog = false;
    this.pendingNavigation = null;
  }
}
