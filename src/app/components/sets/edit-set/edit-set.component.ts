import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableColResizeEvent, TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from '../../../../environments/environment';
import { CanComponentDeactivate } from '../../../guards/unsaved-changes.guard';
import { ConfirmationModalService } from '../../../services/confirmation.service';
import { NotificationService } from '../../../services/notification.service';
import { IConfirmationMessage } from '../../../services/types/IConfirmationMessage';
import {
  calculateBrutto,
  calculateNetto,
  calculateWartosc,
} from '../../../shared/helpers/calculate';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { IBookmark } from '../../bookmarks/IBookmark';
import { IComment } from '../../comments/types/IComment';
import { IFileFullDetails } from '../../files/types/IFileFullDetails';
import { ISupplier } from '../../suppliers/types/ISupplier';
import { ActionBtnsComponent } from '../action-btns/action-btns.component';
import { ImageClipboardInputComponent } from '../image-clipboard-input/image-clipboard-input.component';
import { SetMenuComponent } from '../set-menu/set-menu.component';
import { IFooterRow } from '../types/IFooterRow';
import { IPosition } from '../types/IPosition';
import { ISet } from '../types/ISet';
import { IUpdateSet } from '../types/IUpdateSet';
import { SetStatus } from '../types/SetStatus';
import { ColumnList, IColumnList } from './column-list';
import { EditSetService } from './edit-set.service';
import { FooterService } from './footer.service';
import { IPositionStatus, PositionStatusList } from './PositionStatus';

@Component({
  selector: 'app-set',
  templateUrl: './edit-set.component.html',
  styleUrl: './edit-set.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TabsModule,
    ButtonModule,
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    LoadingSpinnerComponent,
    SelectModule,
    ImageClipboardInputComponent,
    TooltipModule,
    SetMenuComponent,
    ActionBtnsComponent,
  ],
})
export class EditSetComponent
  implements OnInit, CanComponentDeactivate, AfterViewInit
{
  setId!: number;
  set!: ISet;
  positions: IPosition[] = [];
  positionsFromBookmark: IPosition[] = [];
  selectedBookmark: number = 0;
  selectedBookmarks: IBookmark[] = [];
  formData: IPosition[] = [];
  pendingNavigation: Function | null = null;
  destination: string | undefined;
  isLoading = true;
  setIsEdited = false;
  columnList = ColumnList;
  footerRow: IFooterRow[] = [
    {
      name: 'lp',
      key: 'lp',
      type: 'number',
    },
    {
      name: 'actions',
      key: 'actions',
      type: 'string',
    },
    ...ColumnList,
  ];
  positionToDelete: number[] = [];
  allSuppliers: ISupplier[] = [];
  suppliersFromSet: ISupplier[] = [];
  positionStatus: IPositionStatus[] = PositionStatusList;
  dropwownColumnOptions: { [key: string]: any[] } = {};
  FILES_URL = environment.FILES_URL + 'sets/';
  DEFAULT_COLUMN_WIDTH = 200;
  menuItems: MenuItem[] = [];
  @ViewChild(SetMenuComponent) setMenuComponent!: SetMenuComponent;
  queryParams: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private confirmationModalService: ConfirmationModalService,
    private editSetService: EditSetService,
    private notificationService: NotificationService,
    private footerService: FooterService,
    private cd: ChangeDetectorRef
  ) {
    this.onImageUpload = this.onImageUpload.bind(this);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.setId = Number(params.get('id'));
      if (this.setId) {
        this.loadData();
      }
    });
  }

  ngAfterViewInit() {
    if (this.setMenuComponent) {
      this.setMenuComponent.updateMenuItems();
    }

    this.route.queryParams.subscribe((params) => {
      this.queryParams = params;
    });
  }

  // change state of set - mark as edited or not edited
  isEdited(state: boolean) {
    this.setIsEdited = state;
    this.setMenuComponent.updateMenuItems();
  }

  // load needed data from set
  loadData(): void {
    this.editSetService.loadSetData(this.setId).subscribe({
      next: ({ set, positions, suppliers }) => {
        this.set = {
          ...set,
          fullName: set.clientId.firstName + ' ' + set.clientId.lastName,
        };

        this.positions = positions;
        this.allSuppliers = suppliers;

        // map option list for select fields
        this.dropwownColumnOptions = {
          allSuppliers: this.allSuppliers,
          positionStatus: this.positionStatus,
        };

        this.isLoading = false;

        if (set.bookmarks.length > 0) {
          this.updateBookmarks();
        }

        this.initializeForm();

        this.handleQueryParamsAfterDataLoad();
      },
      error: (err) => console.error('Error loading data', err),
    });
  }

  // take edited data from form and update this.position array
  updatePosition(): void {
    this.positions = this.editSetService.updatePosition(
      this.positions,
      this.formData
    );
  }

  // load positions for a given bookmarkID
  loadContentForBookmark(bookmarkId: number) {
    this.updatePosition();

    this.selectedBookmark = bookmarkId;
    this.getColumnWidthToSelectedBookmark();

    this.positionsFromBookmark = [];

    setTimeout(() => {
      this.positionsFromBookmark = this.positions
        .filter(
          (item) =>
            item.bookmarkId?.id === this.selectedBookmark &&
            !this.positionToDelete.includes(item.id)
        )
        .sort((a, b) => a.kolejnosc - b.kolejnosc)
        .map((item: IPosition, index: number) => {
          return {
            ...item,
            kolejnosc: index + 1,
            wartoscNetto: calculateWartosc(item.ilosc, item.netto),
            wartoscBrutto: calculateWartosc(item.ilosc, item.brutto),
          };
        });

      this.initializeForm();
    }, 0);
  }

  // create formData
  initializeForm() {
    this.footerRow = this.footerService.resetFooter(this.footerRow);

    this.formData = this.positionsFromBookmark.map((position: IPosition) => {
      let obj: any = {};
      this.columnList.forEach((column) => {
        if (column.key === 'supplierId') {
          obj[column.key] = position.supplierId
            ? this.allSuppliers.find((s) => s.id === position.supplierId.id) ||
              null
            : null;
        } else {
          obj[column.key] = position[column.key as keyof IPosition];
        }
      });
      this.calculateFooterRow(obj);

      return obj;
    });

    setTimeout(() => {
      this.cd.detectChanges();
    }, 1);
  }

  // get column width from set object
  getColumnWidthToSelectedBookmark() {
    const selectedBookmark = this.set?.bookmarks.find(
      (bookmark) => bookmark.id === this.selectedBookmark
    )?.width;

    if (selectedBookmark && Array.isArray(selectedBookmark)) {
      this.columnList = this.columnList.map((col: IColumnList) => {
        const matchingWidth = selectedBookmark.find((w) => w.name === col.name);
        return matchingWidth
          ? { ...col, width: matchingWidth.width }
          : { ...col, width: this.DEFAULT_COLUMN_WIDTH };
      });
    }
  }

  // update bookmarks after edit header
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

    setTimeout(() => {
      this.loadContentForBookmark(this.selectedBookmark);
    }, 1);
  }

  // action when cell is finish editing
  applyAction(value: any, rowIndex: number, column: any): void {
    this.isEdited(true);
    const newValue = value.srcElement?.value;

    const ilosc = +this.formData[rowIndex]['ilosc'];
    const netto = +this.formData[rowIndex]['netto'];

    switch (column.key) {
      case 'ilosc':
        // column ilosc has changed - calculate new wartoscNetto i wartoscBrutto columns
        this.formData[rowIndex]['wartoscNetto'] = calculateWartosc(
          ilosc,
          netto
        );
        this.formData[rowIndex]['wartoscBrutto'] = calculateWartosc(
          ilosc,
          calculateBrutto(netto)
        );
        break;

      case 'netto':
        // column netto has changed - calculate new brutto, wartoscNetto i wartoscBrutto columns
        const newBrutto = calculateBrutto(+newValue);
        this.formData[rowIndex]['brutto'] = newBrutto;
        this.formData[rowIndex]['wartoscNetto'] = calculateWartosc(
          ilosc,
          +newValue
        );
        this.formData[rowIndex]['wartoscBrutto'] = calculateWartosc(
          ilosc,
          newBrutto
        );
        break;

      case 'brutto':
        // column brutto has changed - calculate new brutto, wartoscbrutto i wartoscBrutto columns
        const newNetto = calculateNetto(+newValue);
        this.formData[rowIndex]['netto'] = newNetto;
        this.formData[rowIndex]['wartoscBrutto'] = calculateWartosc(
          ilosc,
          +newValue
        );
        this.formData[rowIndex]['wartoscNetto'] = calculateWartosc(
          ilosc,
          newNetto
        );
        break;
    }
  }

  // for select content (like ctrl+a) of input field when edit mode, need property (focus)="selectAll($event)" in HTML input
  selectAll(event: FocusEvent): void {
    setTimeout(() => {
      (event.target as HTMLInputElement).select();
    }, 1);
  }

  // calculate values for footer row
  calculateFooterRow(obj: IPosition): void {
    this.footerRow = this.footerService.calculateFooterRow(this.footerRow, obj);
  }

  // add empty position
  addEmptyPosition(kolejnosc: number) {
    this.isEdited(true);

    this.editSetService
      .addEmptyPosition(this.set, this.selectedBookmark, kolejnosc)
      .subscribe({
        next: (response) => {
          this.formData.splice(response.kolejnosc, 0, response);
          this.updateOrder();
          this.updatePosition();
          // if this is first position - change status to in preparation
          if (this.positions?.length === 0) {
            this.set.status = SetStatus.inPreparation;
          }
          this.positions.push(response);

          this.notificationService.showNotification(
            'success',
            'Pusta pozycja została dodana'
          );
        },
        error: (error) => {
          this.notificationService.showNotification('error', error.message);
        },
      });
  }

  // clone selected position
  clonePosition(positionId: number) {
    this.isEdited(true);

    this.editSetService
      .cloneAndPreparePosition(
        positionId,
        this.formData,
        this.set.bookmarks,
        this.selectedBookmark,
        this.setId,
        this.positionStatus
      )
      .subscribe({
        next: (response) => {
          this.formData.splice(response.kolejnosc, 0, response);

          this.formData = this.formData.map((item: IPosition) => {
            return {
              ...item,
              wartoscNetto: calculateWartosc(item.ilosc, item.netto),
              wartoscBrutto: calculateWartosc(item.ilosc, item.brutto),
            };
          });

          this.updateOrder();
          this.updatePosition();
          this.positions.push(response);

          this.notificationService.showNotification(
            'success',
            'Pozycja została sklonowana'
          );
        },
        error: (error) => {
          this.notificationService.showNotification('error', error.message);
        },
      });
  }

  // mark position to be deleted after submit
  deletePosition(positionId: number) {
    this.isEdited(true);

    this.formData = this.formData.filter((item) => item.id !== positionId);
    this.positions = this.positions.filter((item) => item.id !== positionId);

    this.updateOrder();
    this.updatePosition();

    this.positionToDelete.push(positionId);
    this.notificationService.showNotification(
      'warn',
      `Pozycja o ID=${positionId} oznaczona do usunięcia.`
    );
  }

  // save data
  onSubmit() {
    this.updatePosition();
    this.footerRow = this.footerService.resetFooter(this.footerRow);
    this.formData.forEach((pos) => this.calculateFooterRow(pos));

    // need extract status.label from status object to save in DB
    const updatedPositions = this.positions.map((item: any) => ({
      ...item,
      status: item.status?.label || item.status,
    }));

    const savedSet: IUpdateSet = {
      set: this.set,
      positions: updatedPositions,
      positionToDelete: this.positionToDelete,
    };

    this.editSetService.saveSet(savedSet).subscribe({
      next: (response) => {
        this.isEdited(false);
        this.positionToDelete = [];
        if (response.updatedAt) {
          this.set.updatedAt = response.updatedAt;
        }
        this.notificationService.showNotification(
          'success',
          'Dane zestawienia zostały zapisane'
        );
      },
      error: (error) => {
        this.notificationService.showNotification('error', error.message);
      },
    });
  }

  // resize column event - save new column width to this.set.bookmark property
  onColResize(event: TableColResizeEvent) {
    this.isEdited(true);

    this.cd.markForCheck();
    const columnName = event.element.innerText;
    const oldSize: IColumnList | undefined = this.columnList.find(
      (item: IColumnList) => item.name === columnName
    );

    if (oldSize?.width) {
      const delta = Math.floor(event.delta);
      const newSize = oldSize.width + delta;

      // update current this.columnList
      this.columnList = this.columnList.map((item: IColumnList) =>
        item.name === columnName ? { ...item, width: newSize } : item
      );

      // update this.set.bookmarks
      const updatedColumnList = this.columnList
        .filter((item) => item.width !== undefined)
        .map((item: IColumnList) => ({
          name: item.name,
          width: item.width as number,
        }));

      this.set.bookmarks = this.set.bookmarks.map((item: IBookmark) =>
        item.id === this.selectedBookmark
          ? { ...item, width: updatedColumnList }
          : item
      );
    }
  }

  // prevent from exit when form was edited
  canDeactivate(destination?: string): Promise<boolean> {
    if (this.setIsEdited) {
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
    const accept = () => {
      resolve(true);
      setTimeout(() => {
        if (this.destination) {
          this.router.navigate([this.destination]);
        }
      }, 100);
    };

    const reject = () => resolve(false);

    const confirmMessage: IConfirmationMessage = {
      message: 'Masz niezapisane zmiany na stronie!',
      header: 'Czy na pewno chcesz opuścić stronę bez zapisywania?',
      acceptLabel: 'Tak, opuść',
      rejectLabel: 'Nie, zostań',
      accept,
      reject,
    };

    this.confirmationModalService.showConfirmation(confirmMessage);
  }

  // when upload image from clipboard
  onImageUpload = (imageName: string, positionId: string) => {
    this.setIsEdited = true;

    // fill image in position where image was uploaded
    this.formData = this.formData.map((item: IPosition) => {
      if (item.id === +positionId) {
        return { ...item, image: imageName };
      }

      return item;
    });
  };

  // position reorder
  handleRowReorder(event: any) {
    this.isEdited(true);
    this.updateOrder();
  }

  // update kolejnosc property on selected bookmark
  updateOrder() {
    this.formData = this.formData.map((item: IPosition, index: number) => {
      return { ...item, kolejnosc: index + 1 };
    });
  }

  // update comments for current position
  updateCommentsForPosition(res: any) {
    this.positions = this.positions.map((item) => {
      if (item.id === res.id) {
        const newCommentsCount = res.comments.filter(
          (c: IComment) => !c.readByReceiver && c.authorType !== 'user'
        ).length;

        return {
          ...item,
          comments: res.comments,
          newComments: newCommentsCount,
        };
      }

      return { ...item };
    });

    this.updateCommentsForSet();
  }

  // update comments for set, and count newComments property for badge
  updateCommentsForSet() {
    const allComments: IComment[] = [];
    this.positions.forEach((item) => {
      if (item.comments && item.comments.length !== 0) {
        allComments.push(...item.comments);
      }
    });
    this.set.comments = allComments;

    this.set.newComments = allComments
      ? this.countNewComments(this.set.comments, 'user')
      : undefined;
  }

  // count new - unreaded comments
  countNewComments(
    comments: IComment[],
    authorType: 'user' | 'client'
  ): number {
    const newComments = comments.reduce((acc, item) => {
      if (!item.readByReceiver && item.authorType !== authorType) {
        acc += 1;
      }
      return acc;
    }, 0);

    return newComments;
  }

  // update files list after upload new files
  updateFileList(newFiles: IFileFullDetails[]) {
    this.set.files = [...(this.set.files || []), ...newFiles];
  }

  // for link to specific position - from comments section
  handleQueryParamsAfterDataLoad() {
    if (!this.queryParams) return;

    const bookmarkId = this.queryParams['bookmark'];
    const position = this.queryParams['position'];

    if (bookmarkId) {
      this.selectedBookmark = +bookmarkId;
      this.loadContentForBookmark(+bookmarkId);
    }

    if (bookmarkId && position) {
      const anchor = `bookmark-${bookmarkId}-position-${position}`;
      this.tryScrollToAnchor(anchor);
    }
  }

  // smooth scrolling to position
  tryScrollToAnchor(anchor: string, attempts = 5) {
    const el = document.getElementById(anchor);

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });

      el.classList.add('highlighted');
      setTimeout(() => el.classList.remove('highlighted'), 2000);
    } else if (attempts > 0) {
      setTimeout(() => this.tryScrollToAnchor(anchor, attempts - 1), 100);
    }
  }
}
