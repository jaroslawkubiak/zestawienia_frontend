import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableColResizeEvent, TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { CanComponentDeactivate } from '../../../guards/unsaved-changes.guard';
import { AuthService } from '../../../login/auth.service';
import { notificationLifeTime } from '../../../shared/constans';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { bookarksDefaultWidth } from '../../bookmarks/bookmarks-width';
import { IBookmark } from '../../bookmarks/IBookmark';
import { EditHeaderComponent } from '../edit-header/edit-header.component';
import { SetsService } from '../sets.service';
import { IPosition } from '../types/IPosition';
import { ISet } from '../types/ISet';
import { ISetHeader } from '../types/ISetHeader';
import { IUpdateSet } from '../types/IUpdateSet';
import { columnList, IColumnList } from './column-list';

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
    LoadingSpinnerComponent,
    SelectModule,
    Dialog,
    EditHeaderComponent,
  ],
  providers: [SetsService, ConfirmationService, MessageService],
})
export class EditSetComponent implements OnInit, CanComponentDeactivate {
  private authorizationToken: string | null;
  userId: number | null;
  setName: string = '';
  setStatus: string = '';
  setId!: string;
  set!: ISet;
  positions: IPosition[] = [];
  positionsFromBookmark: IPosition[] = [];
  selectedBookmark: number = 0;
  selectedBookmarks: IBookmark[] = [];
  formData: IPosition[] = [];
  pendingNavigation: Function | null = null;
  destination: string | undefined;
  isLoading = true;
  editHeaderDialog = false;
  submitted = false;
  isEdited = false;
  columnList = columnList;
  editHeaderProps!: ISetHeader;

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
          this.setName = this.set.name;
          this.setStatus = this.set.status;

          if (this.set.bookmarks.length > 0) {
            this.updateBookmarks();
          }
          this.isLoading = false;
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
    const formDataMap = new Map(
      this.formData.map((form: IPosition) => [form.id, form])
    );

    this.positions = this.positions.map((position: IPosition) => {
      const form = formDataMap.get(position.id);

      return form ? { ...position, ...form } : position;
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
    const selectedBookmark = this.set.bookmarks.find(
      (bookmark) => bookmark.id === this.selectedBookmark
    )?.width;

    if (selectedBookmark && Array.isArray(selectedBookmark)) {
      this.columnList = this.columnList.map((col) => {
        const matchingWidth = selectedBookmark.find((w) => w.name === col.name);

        return matchingWidth ? { ...col, width: matchingWidth.width } : col;
      });
    }
  }

  updateBookmarks() {
    this.set.bookmarks.sort((a, b) => a.id - b.id);

    // mark first (lowest id) bookmark as selected
    this.selectedBookmark = this.set.bookmarks[0].id;

    // make copy of bookmarks for header edit
    this.selectedBookmarks = JSON.parse(JSON.stringify(this.set.bookmarks));
    this.selectedBookmarks.forEach((item) => {
      delete item.width;
      return (item.default = true);
    });

    this.loadContent(this.selectedBookmark);
  }
  // save data
  onSubmit() {
    this.updatePosition();

    this.set.status = this.setStatus;
    this.set.name = this.setName;

    if (this.authorizationToken && this.userId) {
      const savedSet: IUpdateSet = {
        userId: this.userId,
        set: this.set,
        positions: this.positions,
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

  // edit set header
  editHeader() {
    this.editHeaderProps = {
      name: this.setName,
      selectedStatus: this.setStatus,
      selectedBookmarks: this.selectedBookmarks,
    };

    this.editHeaderDialog = true;
  }

  hideDialog() {
    this.editHeaderDialog = false;
    this.submitted = false;
  }

  // set header data change
  onDataChange(headerData: ISetHeader) {
    const originalMap = new Map(
      this.set.bookmarks.map((item) => [item.id, item])
    );

    this.set.bookmarks = headerData.selectedBookmarks.map((item) => ({
      ...item,
      width: originalMap.get(item.id)?.width || bookarksDefaultWidth,
    }));
    this.updateBookmarks();

    this.setName = headerData.name;
    this.setStatus = headerData.selectedStatus;

    this.messageService.add({
      severity: 'info',
      summary: 'Informacja',
      detail: 'Nagłówek zestawienia został zmieniony',
      life: notificationLifeTime,
    });

    this.isEdited = true;
  }
}
