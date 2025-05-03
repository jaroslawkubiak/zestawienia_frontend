import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableColResizeEvent, TableModule } from 'primeng/table';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../services/notification.service';
import {
  calculateBrutto,
  calculateNetto,
  calculateWartosc,
} from '../../../shared/helpers/calculate';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { IBookmark } from '../../bookmarks/IBookmark';
import { IBookmarksWidth } from '../../bookmarks/IBookmarksWidth';
import { IComment } from '../../comments/types/IComment';
import { ISupplier } from '../../suppliers/types/ISupplier';
import { ActionBtnsComponent } from '../action-btns/action-btns.component';
import { ColumnList, IColumnList } from '../edit-set/column-list';
import { EditSetService } from '../edit-set/edit-set.service';
import { FooterService } from '../edit-set/footer.service';
import {
  IPositionStatus,
  PositionStatusList,
} from '../edit-set/PositionStatus';
import { ImageClipboardInputComponent } from '../image-clipboard-input/image-clipboard-input.component';
import { IFooterRow } from '../types/IFooterRow';
import { IPosition } from '../types/IPosition';
import { ISet } from '../types/ISet';
import { SetStatus } from '../types/SetStatus';
import { Dialog } from 'primeng/dialog';
import { CommentsComponent } from '../../comments/comments.component';
import { IPositionWithComments } from '../../comments/types/IPositionWithComments';

@Component({
  selector: 'app-positions-table',
  imports: [
    TableModule,
    InputTextModule,
    ButtonModule,
    CommonModule,
    SelectModule,
    FormsModule,
    ImageClipboardInputComponent,
    LoadingSpinnerComponent,
    ActionBtnsComponent,
    Dialog,
    CommentsComponent,
  ],
  standalone: true,

  templateUrl: './positions-table.component.html',
  styleUrl: './positions-table.component.css',
})
export class PositionsTableComponent implements OnInit {
  @Input() set!: ISet;
  @Input() selectedBookmark!: number;
  @Input() positionsFromBookmark: IPosition[] = [];
  @Input() allSuppliers: ISupplier[] = [];
  @Input() dropwownColumnOptions: { [key: string]: any[] } = {};
  @Output() isEdited = new EventEmitter<boolean>();
  @Output() updateSetPositions = new EventEmitter<IPosition>();
  @Output() updateSetComments = new EventEmitter<IComment[]>();
  formData: IPosition[] = [];
  newOrClonePosition: IPosition | undefined;
  FILES_URL = environment.FILES_URL + 'sets/';
  positionToDelete: number[] = [];
  DEFAULT_COLUMN_WIDTH = 200;
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
  positionStatus: IPositionStatus[] = PositionStatusList;
  setId: number = 0;
  positionId: number = 0;
  showCommentsDialog = false;
  header = '';
  comments: IComment[] = [];

  constructor(
    private editSetService: EditSetService,
    private notificationService: NotificationService,
    private footerService: FooterService,
    private cd: ChangeDetectorRef
  ) {
    this.onImageUpload = this.onImageUpload.bind(this);
  }

  ngOnInit() {
    if (this.positionsFromBookmark) {
      // map option list for select fields
      this.dropwownColumnOptions = {
        allSuppliers: this.allSuppliers,
        positionStatus: this.positionStatus,
      };
    }

    this.setId = this.set.id;
  }

  // mark set as edited
  onIsEdited(state: boolean) {
    this.isEdited.emit(state);
  }

  // create formData
  initializeForm() {
    this.footerRow = this.footerService.resetFooter(this.footerRow);
    this.getColumnWidthToSelectedBookmark();

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

      return obj;
    });

    this.calculateFooterRow();

    this.refresh();
  }

  // add empty position
  addEmptyPosition(kolejnosc: number) {
    this.onIsEdited(true);
    this.editSetService
      .addEmptyPosition(this.set, this.selectedBookmark, kolejnosc)
      .subscribe({
        next: (response) => {
          this.formData = [
            ...this.formData.slice(0, response.kolejnosc),
            response,
            ...this.formData.slice(response.kolejnosc),
          ];

          this.newOrClonePosition = response;
          this.updateOrder();
          this.updateSetPositions.emit();

          // if this is first position - change status to in preparation
          if (this.positionsFromBookmark?.length === 0) {
            this.set.status = SetStatus.inPreparation;
          }
          this.positionsFromBookmark.push(response);

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
    this.onIsEdited(true);
    this.editSetService
      .cloneAndPreparePosition(
        positionId,
        this.formData,
        this.set.bookmarks,
        this.selectedBookmark,
        this.set.id
      )
      .subscribe({
        next: (response) => {
          this.formData = [
            ...this.formData.slice(0, response.kolejnosc),
            response,
            ...this.formData.slice(response.kolejnosc),
          ];

          this.formData = this.formData.map((item: IPosition) => {
            return {
              ...item,
              wartoscNetto: calculateWartosc(item.ilosc, item.netto),
              wartoscBrutto: calculateWartosc(item.ilosc, item.brutto),
            };
          });

          this.newOrClonePosition = response;
          this.positionsFromBookmark.push(response);

          this.updateOrder();
          this.updateSetPositions.emit();

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
    this.onIsEdited(true);
    // remove position from formData and positionsFromBookmark
    this.formData = this.formData.filter((item) => item.id !== positionId);
    this.positionsFromBookmark = this.positionsFromBookmark.filter(
      (item) => item.id !== positionId
    );

    // mark position id to be deleted after submit form
    this.positionToDelete.push(positionId);

    this.updateOrder();
    this.updateSetPositions.emit();

    this.notificationService.showNotification(
      'warn',
      `Pozycja o ID=${positionId} oznaczona do usunięcia.`
    );
  }

  // get column width from set object
  getColumnWidthToSelectedBookmark() {
    const selectedBookmark: IBookmarksWidth[] | undefined =
      this.set?.bookmarks.find(
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

  // when upload image from clipboard
  onImageUpload = (imageName: string, positionId: string) => {
    this.onIsEdited(true);

    // fill image in position where image was uploaded
    this.formData = this.formData.map((item: IPosition) => {
      if (item.id === +positionId) {
        return { ...item, image: imageName };
      }

      return item;
    });
  };

  // action when cell is finish editing
  applyAction(value: any, rowIndex: number, column: IColumnList): void {
    this.onIsEdited(true);
    const newValue = value.srcElement?.value;

    const ilosc = +this.formData[rowIndex]['ilosc'];
    const netto = +this.formData[rowIndex]['netto'];

    switch (column.key) {
      // column ilosc has changed - calculate new wartoscNetto i wartoscBrutto columns
      case 'ilosc':
        this.formData[rowIndex]['wartoscNetto'] = calculateWartosc(
          ilosc,
          netto
        );
        this.formData[rowIndex]['wartoscBrutto'] = calculateWartosc(
          ilosc,
          calculateBrutto(netto)
        );
        break;

      // column netto has changed - calculate new brutto, wartoscNetto i wartoscBrutto columns
      case 'netto':
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

      // column brutto has changed - calculate new brutto, wartoscbrutto i wartoscBrutto columns
      case 'brutto':
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

  // for select content (like ctrl+a) of input field when edit mode,
  // need property (focus)="selectAll($event)" in HTML input
  selectAll(event: FocusEvent): void {
    setTimeout(() => {
      (event.target as HTMLInputElement).select();
    }, 1);
  }

  // update kolejnosc property on selected bookmark
  updateOrder() {
    this.formData = this.formData.map((item: IPosition, index: number) => {
      return { ...item, kolejnosc: index + 1 };
    });
  }

  // resize column event - save new column width to this.set.bookmark property
  onColResize(event: TableColResizeEvent) {
    this.onIsEdited(true);

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

  // position reorder
  handleRowReorder(event: any) {
    this.onIsEdited(true);
    this.updateOrder();
  }

  // count wartosc netto i wartosc brutto in footer row
  updateFooter() {
    this.footerRow = this.footerService.resetFooter(this.footerRow);
    this.calculateFooterRow();
  }

  // calculate values for footer row
  calculateFooterRow(): void {
    this.footerRow = this.footerService.calculateFooterRow(
      this.footerRow,
      this.formData
    );
  }

  // refresh table view
  refresh() {
    setTimeout(() => {
      this.cd.detectChanges();
    }, 1);
  }

  // update comments for set, and count newComments property for badge
  updateCommentsForSet() {
    const allComments: IComment[] = [];
    this.positionsFromBookmark.forEach((item: IPosition) => {
      if (item.comments && item.comments.length !== 0) {
        allComments.push(...item.comments);
      }
    });

    this.updateSetComments.emit(allComments);
  }

  // show dialog with comments for current position
  showComments(positionId: number) {
    this.positionId = positionId;
    const position = this.positionsFromBookmark.find(
      (item) => item.id === positionId
    );

    if (position?.comments) {
      this.comments = position.comments;
      this.header = `Pozycja ${position.kolejnosc} ${
        position.produkt ? ' : ' + position.produkt : ''
      }`;
      this.showCommentsDialog = true;
    }
  }

  // update comments for current position
  updateCommentsForPosition(positionWithComments: IPositionWithComments) {
    this.positionsFromBookmark = this.positionsFromBookmark.map((item) => {
      if (
        positionWithComments.comments &&
        item.id === positionWithComments.positionId
      ) {
        const newCommentsCount = positionWithComments.comments.filter(
          (c: IComment) => !c.readByReceiver && c.authorType !== 'user'
        ).length;

        return {
          ...item,
          comments: positionWithComments.comments,
          newComments: newCommentsCount,
        };
      }

      return { ...item };
    });

    this.updateCommentsForSet();
  }
}
