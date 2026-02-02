import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table, TableColResizeEvent, TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../services/notification.service';
import {
  calculateBrutto,
  calculateNetto,
  calculateWartosc,
} from '../../../shared/helpers/calculate';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { IBookmarksWithTableColumns } from '../../bookmarks/types/IBookmarksWithTableColumns';
import { ITableColumnWidth } from '../../bookmarks/types/ITableColumnWidth';
import { CommentsComponent } from '../../comments/comments.component';
import { ImageGalleryComponent } from '../../image-gallery/image-gallery.component';
import { IGalleryList } from '../../image-gallery/types/IGalleryList';
import { ISupplier } from '../../suppliers/ISupplier';
import { ActionBtnsComponent } from '../action-btns/action-btns.component';
import { ColumnList } from '../ColumnList';
import { EditSetService } from '../edit-set/edit-set.service';
import { FooterService } from '../edit-set/footer.service';
import { ImageClipboardInputComponent } from '../image-clipboard-input/image-clipboard-input.component';
import { PositionStatusList } from '../PositionStatusList';
import { IFooterRow } from '../types/IFooterRow';
import { IPositionStatus } from './types/IPositionStatus';
import { ISet } from '../types/ISet';
import { SetStatus } from '../types/set-status.enum';
import { IColumnList } from './types/IColumnList';
import { IPosition } from './types/IPosition';
import { CommentsService } from '../../comments/comments.service';
import { IComment } from '../../comments/types/IComment';

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
    TextareaModule,
    CommentsComponent,
    ImageGalleryComponent,
    TooltipModule,
  ],
  standalone: true,
  templateUrl: './positions-table.component.html',
  styleUrl: './positions-table.component.css',
})
export class PositionsTableComponent implements OnInit, OnChanges {
  @Input() set!: ISet;
  @Input() selectedBookmark!: number;
  @Input() positionsFromBookmark: IPosition[] = [];
  @Input() allSuppliers: ISupplier[] = [];
  @Input() dropwownColumnOptions: { [key: string]: any[] } = {};
  @Output() isEdited = new EventEmitter<boolean>();
  @Output() updateSetPositions = new EventEmitter<IPosition>();
  @Output() updateSetComments = new EventEmitter();

  formData: IPosition[] = [];
  newOrClonePosition: IPosition | undefined;
  FILES_URL = environment.FILES_URL;
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
  positionStatus: IPositionStatus[] = PositionStatusList.filter((s) => s.label);
  setId: number = 0;
  positionIdForComments: number = 0;
  showCommentsDialog = false;
  commentsForPosition: IComment[] = [];
  header = '';
  @ViewChild('table') table!: Table;
  @ViewChild('imageGallery') imageGallery!: ImageGalleryComponent;

  constructor(
    private editSetService: EditSetService,
    private notificationService: NotificationService,
    private footerService: FooterService,
    private commentsService: CommentsService,
    private cd: ChangeDetectorRef,
  ) {
    this.onImageUpload = this.onImageUpload.bind(this);
  }

  ngOnInit() {
    // map option list for select fields
    this.dropwownColumnOptions = {
      allSuppliers: this.allSuppliers,
      positionStatus: this.positionStatus,
    };

    this.setId = this.set.id;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['positionsFromBookmark']) {
      const positions = changes['positionsFromBookmark']
        .currentValue as IPosition[];
    }
  }

  scrollToPosition(positionNumber: number) {
    const index = positionNumber - 1;

    if (!this.table || index < 0) return;

    setTimeout(() => {
      this.table.scrollToVirtualIndex(index);
    }, 50);
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
            'Pusta pozycja została dodana',
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
        this.set.id,
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
            'Pozycja została sklonowana',
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
    const removedPosition = this.positionsFromBookmark.find(
      (item) => item.id === positionId,
    );

    // remove position from formData and positionsFromBookmark
    this.formData = this.formData.filter((item) => item.id !== positionId);
    this.positionsFromBookmark = this.positionsFromBookmark.filter(
      (item) => item.id !== positionId,
    );

    // mark position id to be deleted after submit form
    this.positionToDelete.push(positionId);

    this.updateOrder();
    this.updateSetPositions.emit();

    const message = removedPosition?.produkt
      ? `Produkt "${removedPosition?.produkt}" zostanie usunięty.`
      : `Pozycja zostanie usunięta.`;

    this.notificationService.showNotification('warn', message);
  }

  // get column width from set object
  getColumnWidthToSelectedBookmark() {
    const selectedBookmark: ITableColumnWidth[] | undefined =
      this.set?.bookmarks.find(
        (bookmark) => bookmark.id === this.selectedBookmark,
      )?.columnWidth;

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
          netto,
        );
        this.formData[rowIndex]['wartoscBrutto'] = calculateWartosc(
          ilosc,
          calculateBrutto(netto),
        );
        break;

      // column netto has changed - calculate new brutto, wartoscNetto i wartoscBrutto columns
      case 'netto':
        const newBrutto = calculateBrutto(+newValue);
        this.formData[rowIndex]['brutto'] = newBrutto;
        this.formData[rowIndex]['wartoscNetto'] = calculateWartosc(
          ilosc,
          +newValue,
        );
        this.formData[rowIndex]['wartoscBrutto'] = calculateWartosc(
          ilosc,
          newBrutto,
        );
        break;

      // column brutto has changed - calculate new brutto, wartoscbrutto i wartoscBrutto columns
      case 'brutto':
        const newNetto = calculateNetto(+newValue);
        this.formData[rowIndex]['netto'] = newNetto;
        this.formData[rowIndex]['wartoscBrutto'] = calculateWartosc(
          ilosc,
          +newValue,
        );
        this.formData[rowIndex]['wartoscNetto'] = calculateWartosc(
          ilosc,
          newNetto,
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
      (item: IColumnList) => item.name === columnName,
    );

    if (oldSize?.width) {
      const delta = Math.floor(event.delta);
      const newSize = oldSize.width + delta;

      // update current this.columnList
      this.columnList = this.columnList.map((item: IColumnList) =>
        item.name === columnName ? { ...item, width: newSize } : item,
      );

      // update this.set.bookmarks
      const updatedColumnList = this.columnList
        .filter((item) => item.width !== undefined)
        .map((item: IColumnList) => ({
          name: item.name,
          width: item.width as number,
        }));

      this.set.bookmarks = this.set.bookmarks.map(
        (item: IBookmarksWithTableColumns) =>
          item.id === this.selectedBookmark
            ? { ...item, width: updatedColumnList }
            : item,
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
      this.formData,
    );
  }

  // refresh table view
  refresh() {
    setTimeout(() => {
      this.cd.detectChanges();
    }, 1);
  }

  // show dialog with comments for current position
  showComments(positionId: number) {
    this.positionIdForComments = positionId;
    const position = this.positionsFromBookmark.find(
      (item) => item.id === positionId,
    );

    if (position) {
      this.commentsService.getCommentsForPosition(positionId).subscribe({
        next: (response) => {
          this.commentsForPosition = response;
          this.header = `Pozycja ${position.kolejnosc} ${
            position.produkt ? ' : ' + position.produkt : ''
          }`;

          this.showCommentsDialog = true;
          this.cd.markForCheck();
        },
        error: (error) => {
          this.notificationService.showNotification('error', error.message);
        },
      });
    }
  }

  // open gallery with bookmark images
  onShowImageClick(event: MouseEvent, position: IPosition) {
    event.stopPropagation();
    event.preventDefault();

    const clickedImageUrl = this.getImagePreviewUrl(position);
    if (!clickedImageUrl) return;

    const galleryImages: IGalleryList[] = this.formData
      .map((pos) => {
        if (pos['image']) {
          return {
            itemImageSrc: this.getImagePreviewUrl(pos),
            thumbnailImageSrc: this.getImagePreviewUrl(pos),
          };
        }
        return null;
      })
      .filter((img) => img !== null) as IGalleryList[];

    const activeIndex = galleryImages.findIndex(
      (img) => img.itemImageSrc === clickedImageUrl,
    );

    this.imageGallery.images = galleryImages;
    this.imageGallery.openGallery(activeIndex);
  }

  // prepare image url
  getImagePreviewUrl(position: IPosition): string {
    const fileName = position['image'];

    if (!fileName) {
      return '';
    }

    return `${this.FILES_URL}/sets/${this.set.id}/${this.set.hash}/positions/${position.id}/${fileName}`;
  }

  // on close dialog with comments
  onCloseCommentsDialog() {
    this.updateSetComments.emit();
  }
}
