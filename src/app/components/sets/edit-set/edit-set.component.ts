import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TableColResizeEvent, TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { CanComponentDeactivate } from '../../../guards/unsaved-changes.guard';
import { AuthService } from '../../../login/auth.service';
import { IBookmark } from '../../bookmarks/IBookmark';
import { SetsService } from '../sets.service';
import { IPosition } from '../types/IPosition';
import { ISet } from '../types/ISet';
import { columnList, IColumnList } from './column-list';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { notificationLifeTime } from '../../../shared/constans';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { IUpdateSet } from '../types/IUpdateSet';

@Component({
  selector: 'app-set',
  templateUrl: './edit-set.component.html',
  styleUrl: './edit-set.component.css',
  standalone: true,
  imports: [
    ToastModule,
    TabsModule,
    ButtonModule,
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ConfirmDialog,
  ],
  providers: [SetsService, ConfirmationService, MessageService],
})
export class EditSetComponent implements OnInit, CanComponentDeactivate {
  private authorizationToken: string | null;
  userId: number | null;
  setId!: string;
  isEdited: boolean = false;
  set!: ISet;
  positions: IPosition[] = [];
  positionsFromBookmark: IPosition[] = [];
  bookmarks: IBookmark[] = [];
  selectedBookmark: number = 0;
  formData: any[] = [];
  columnList = columnList;
  pendingNavigation: Function | null = null;
  destination: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private setsService: SetsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cd: ChangeDetectorRef
  ) {
    this.authorizationToken = this.authService.authorizationToken;
    this.userId = this.authService.userId();
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

  // mark form as edited - dirty
  markAsEdited() {
    this.isEdited = true;
  }

  // request to get set data
  getSet(): void {
    if (this.authorizationToken) {
      this.setsService.getSet(this.authorizationToken, this.setId).subscribe({
        next: (data) => {
          this.set = data[0];
          this.bookmarks = this.set.bookmarks;

          //mark first (lowest id) bookmark as selected
          this.selectedBookmark = Math.min(
            ...this.bookmarks.map((item) => item.id)
          );
          this.loadContent(this.selectedBookmark);
        },
        error: (err) => console.error('Error getting set ', err),
      });
    }
  }

  // request to get position data
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

  // take edited data from form and update this.position array
  updatePosition(): void {
    this.positions = this.positions.map((position: IPosition) => {
      const form = this.formData.find(
        (form: IPosition) => form.id === position.id
      );

      return form ? { ...position, ...form } : { ...position };
    });
  }

  // load positions for a given bookmark
  loadContent(bookmarkId: number) {
    this.updatePosition();

    this.selectedBookmark = bookmarkId;
    this.getColumnWidthToSelectedBookmark();

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

  // get column width from set object
  getColumnWidthToSelectedBookmark() {
    const bookmark: IBookmark | undefined = this.set.bookmarks.find(
      (item) => item.id === this.selectedBookmark
    );
    if (bookmark?.width) {
      const widths = bookmark.width;
      this.columnList = columnList.map((col) => {
        const matchingWidth = widths.find((w) => w.name === col.name);
        return matchingWidth ? { ...col, width: matchingWidth.width } : col;
      });
    }
  }

  // save data
  onSubmit() {
    this.updatePosition();

    const setCopy: Partial<ISet> = { ...this.set };
    // delete unnecessary property
    delete setCopy.createdAt;
    delete setCopy.createdAtTimestamp;
    delete setCopy.updatedAt;
    delete setCopy.updatedAtTimestamp;
    delete setCopy.hash;
    delete setCopy.clientId;
    delete setCopy.createdBy;
    delete setCopy.updatedBy;

    // delete unnecessary property
    const positionCopy: Partial<IPosition[]> = [...this.positions];
    // positionCopy.forEach((item) => {
    //   if (item) {
    //     delete item.bookmarkId;
    //     delete item.createdBy;
    //     delete item.updatedBy;
    //     delete item.acceptedStatus;
    //     delete item.acceptedAt;
    //     delete item.acceptedAtTimestamp;
    //     delete item.createdAt;
    //     delete item.createdAtTimestamp;
    //     delete item.updatedAt;
    //     delete item.updatedAtTimestamp;
    //   }
    // });

    if (this.authorizationToken && this.userId) {
      const savedSet: IUpdateSet = {
        set: setCopy,
        positions: positionCopy,
        userId: this.userId,
      };

      this.setsService.saveSet(this.authorizationToken, savedSet).subscribe({
        next: (response) => {
          this.isEdited = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Sukces',
            detail: 'Dane zestawienia zostały zapisane',
            life: notificationLifeTime,
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Błąd',
            detail: error.message,
            life: notificationLifeTime,
          });
        },
      });
    }
  }

  // resize column event - save new column width to this.set.bookmark property
  onColResize(event: TableColResizeEvent) {
    this.markAsEdited();
    this.cd.markForCheck();
    const columnName = event.element.innerText;
    const oldSize: IColumnList | undefined = this.columnList.find(
      (item: IColumnList) => item.name === columnName
    );

    if (oldSize?.width) {
      const delta = Math.floor(event.delta);
      const newSize = oldSize.width + delta;

      // update current this.columnList
      this.columnList = this.columnList.map((item) =>
        item.name === columnName ? { ...item, width: newSize } : item
      );

      // update this.set.bookmarks
      const updatedColumnList = this.columnList
        .filter((item) => item.width !== undefined)
        .map((item) => ({ name: item.name, width: item.width as number }));

      this.set.bookmarks = this.set.bookmarks.map((item) =>
        item.id === this.selectedBookmark
          ? { ...item, width: updatedColumnList }
          : item
      );
    }
  }

  // prevent from exit when form was edited
  canDeactivate(destination?: string): Promise<boolean> {
    if (this.isEdited) {
      this.destination = destination;
      return new Promise((resolve) => {
        this.pendingNavigation = () => resolve(true);
        this.exitPage(resolve);
      });
    }

    return Promise.resolve(true);
  }

  // confirmation window when form was edited and not saved
  exitPage(resolve: (value: boolean) => void) {
    this.confirmationService.confirm({
      message: 'Masz niezapisane zmiany na stronie!',
      header: 'Czy na pewno chcesz opuścić stronę bez zapisywania?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Tak, opuść',
      acceptIcon: 'pi pi-check',
      acceptButtonStyleClass: 'p-button-danger',
      rejectLabel: 'Nie, zostań',
      rejectIcon: 'pi pi-times',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        resolve(true);
        setTimeout(() => {
          if (this.destination) {
            this.router.navigate([this.destination]);
          }
        }, 100);
      },
      reject: () => {
        resolve(false);
      },
    });
  }
}
