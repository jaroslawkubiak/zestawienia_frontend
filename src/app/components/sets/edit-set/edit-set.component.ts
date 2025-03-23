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
import { TooltipModule } from 'primeng/tooltip';
import { forkJoin } from 'rxjs';
import { CanComponentDeactivate } from '../../../guards/unsaved-changes.guard';
import { AuthService } from '../../../login/auth.service';
import { IUser } from '../../../login/IUser';
import {
  calculateBrutto,
  calculateWartosc,
} from '../../../shared/helpers/calculate';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { bookarksDefaultWidth } from '../../bookmarks/bookmarks-width';
import { IBookmark } from '../../bookmarks/IBookmark';
import { ISupplier } from '../../suppliers/ISupplier';
import { SuppliersService } from '../../suppliers/suppliers.service';
import { EditHeaderComponent } from '../edit-header/edit-header.component';
import { ImageClipboardInputComponent } from '../image-clipboard-input/image-clipboard-input.component';
import { IClonePosition } from '../types/IClonePosition';
import { IFooterRow } from '../types/IFooterRow';
import { INewEmptyPosition } from '../types/INewEmptyPosition';
import { IPosition } from '../types/IPosition';
import { ISet } from '../types/ISet';
import { ISetHeader } from '../types/ISetHeader';
import { IUpdateSet } from '../types/IUpdateSet';
import { columnList, IColumnList } from './column-list';
import { EditSetService } from './edit-set.service';
import { NotificationService } from '../../../services/notification.service';

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
    ImageClipboardInputComponent,
    TooltipModule,
  ],
  providers: [
    ConfirmationService,
    EditSetService,
    SuppliersService,
    AuthService,
    NotificationService,
    MessageService,
  ],
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
    ...columnList,
  ];

  positionToDelete: number[] = [];

  allSuppliers: ISupplier[] = [];

  BASE_IMAGE_URL = 'http://localhost:3005/uploads/sets/';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private suppliersService: SuppliersService,
    private confirmationService: ConfirmationService,
    private editSetService: EditSetService,
    private notificationService: NotificationService,
    private cd: ChangeDetectorRef
  ) {
    this.authorizationToken = this.authService.authorizationToken;
    this.userId = this.authService.userId();
    this.onImageUpload = this.onImageUpload.bind(this);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.setId = params.get('id') || '';
      if (this.setId) {
        this.loadData();
      }
    });
  }

  // load needed data from set
  loadData(): void {
    if (!this.authorizationToken) return;

    forkJoin({
      set: this.editSetService.getSet(this.authorizationToken, this.setId),
      positions: this.editSetService.getPositions(
        this.authorizationToken,
        this.setId
      ),
      suppliers: this.suppliersService.getSuppliers(this.authorizationToken),
    }).subscribe({
      next: ({ set, positions, suppliers }) => {
        this.set = set[0];
        this.setName = this.set.name;
        this.setStatus = this.set.status;
        this.positions = positions;
        this.allSuppliers = suppliers;

        if (this.set.bookmarks.length > 0) {
          this.updateBookmarks();
        }

        this.initializeForm();
      },
      error: (err) => console.error('Error loading data ', err),
    });
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

  // load positions for a given bookmarkID
  loadContentForBookmark(bookmarkId: number) {
    this.updatePosition();

    this.selectedBookmark = bookmarkId;
    this.getColumnWidthToSelectedBookmark();

    this.positionsFromBookmark = this.positions
      .filter(
        (item) =>
          item.bookmarkId?.id === this.selectedBookmark &&
          !this.positionToDelete.includes(item.id)
      )
      .sort((a, b) => a.kolejnosc - b.kolejnosc)
      .map((item: IPosition, index: number) => {
        const brutto = calculateBrutto(item.netto);
        const dostawca = item.supplierId?.firma;
        return {
          ...item,
          kolejnosc: index + 1,
          dostawca,
          brutto,
          wartoscNetto: calculateWartosc(item.ilosc, item.netto),
          wartoscBrutto: calculateWartosc(item.ilosc, brutto),
        };
      });

    this.initializeForm();
  }

  // if column.unit is provided = add it to display, ex: PLN
  getFormattedValue(column: any): string {
    return column.value + (column.unit ? ' ' + column.unit : '');
  }

  // create formData
  initializeForm() {
    this.resetFooter();

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

    this.isLoading = false;
  }

  // get column width from set object
  getColumnWidthToSelectedBookmark() {
    const selectedBookmark = this.set.bookmarks.find(
      (bookmark) => bookmark.id === this.selectedBookmark
    )?.width;

    if (selectedBookmark && Array.isArray(selectedBookmark)) {
      this.columnList = this.columnList.map((col: IColumnList) => {
        const matchingWidth = selectedBookmark.find((w) => w.name === col.name);

        return matchingWidth ? { ...col, width: matchingWidth.width } : col;
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

    this.loadContentForBookmark(this.selectedBookmark);
  }

  // action when cell is finish editing
  applyAction(value: any, rowIndex: number, column: any): void {
    this.isEdited = true;
    const newValue = value.srcElement?.value;

    // column ilosc has changed - calculate new wartoscNetto i wartoscBrutto columns
    if (column.key === 'ilosc') {
      const nowaWartoscNetto = calculateWartosc(
        +newValue,
        +this.formData[rowIndex]['netto']
      );
      this.formData[rowIndex]['wartoscNetto'] = nowaWartoscNetto;

      const nowaWartoscrutto = calculateWartosc(
        +newValue,
        calculateBrutto(+this.formData[rowIndex]['netto'])
      );
      this.formData[rowIndex]['wartoscBrutto'] = nowaWartoscrutto;
    }

    // column netto has changed - calculate new brutto, wartoscNetto i wartoscBrutto columns
    if (column.key === 'netto') {
      this.formData[rowIndex]['brutto'] = calculateBrutto(+newValue);

      const nowaWartoscNetto = calculateWartosc(
        +this.formData[rowIndex]['ilosc'],
        +this.formData[rowIndex]['netto']
      );
      this.formData[rowIndex]['wartoscNetto'] = nowaWartoscNetto;

      const nowaWartoscrutto = calculateWartosc(
        +this.formData[rowIndex]['ilosc'],
        +this.formData[rowIndex]['brutto']
      );
      this.formData[rowIndex]['wartoscBrutto'] = nowaWartoscrutto;
    }

    this.resetFooter();
    this.calculateFooterRow(this.formData[rowIndex]);
  }

  // for select content (like ctrl+a) of input field when edit mode, need property (focus)="selectAll($event)" in HTML input
  selectAll(event: FocusEvent): void {
    setTimeout(() => {
      (event.target as HTMLInputElement).select();
    }, 0);
  }

  // reset footer row
  resetFooter() {
    this.footerRow = this.footerRow.map((item: IFooterRow) => ({
      ...item,
      value: '',
    }));
  }

  // calculate values for footer row
  calculateFooterRow(obj: IPosition) {
    this.footerRow = this.footerRow.map((item: IFooterRow) => {
      switch (item.key) {
        case 'ilosc':
          item.value = Number(item.value) + Number(obj.ilosc);
          item.classFooter = 'position-footer-number';
          break;
        case 'netto':
          item.value = (
            Math.round((Number(item.value) + Number(obj.netto)) * 100) / 100
          ).toFixed(2);
          item.classFooter = 'position-footer-number';
          break;
        case 'brutto':
          item.value = (
            Math.round((Number(item.value) + Number(obj.brutto)) * 100) / 100
          ).toFixed(2);
          item.classFooter = 'position-footer-number';
          break;
        case 'wartoscNetto':
          item.value = (
            Math.round((Number(item.value) + Number(obj.wartoscNetto)) * 100) /
            100
          ).toFixed(2);
          item.classFooter = 'position-footer-number';
          break;
        case 'wartoscBrutto':
          item.value = (
            Math.round((Number(item.value) + Number(obj.wartoscBrutto)) * 100) /
            100
          ).toFixed(2);
          item.classFooter = 'position-footer-number';
          break;
      }

      return { ...item };
    });
  }

  // share set to client
  shareSet() {
    console.log(`shareSet`);
  }

  // add empty position
  addEmptyPosition(kolejnosc: number) {
    this.isEdited = true;

    const bookmark = this.set.bookmarks.filter(
      (item) => item.id === this.selectedBookmark
    );

    const newPosition: INewEmptyPosition = {
      kolejnosc: kolejnosc,
      bookmarkId: bookmark[0],
      createdBy: { id: this.userId } as IUser,
      updatedBy: { id: this.userId } as IUser,
      setId: { id: +this.setId } as ISet,
    };

    this.editSetService
      .addPosition(this.authorizationToken, newPosition)
      .subscribe({
        next: (response) => {
          // put new position in place according to property kolejnosc
          this.formData.splice(response.kolejnosc, 0, response);

          this.updateOrder();
          this.updatePosition();
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
    this.isEdited = true;

    const originalPosition = this.formData.find(
      (item) => item.id === positionId
    );

    if (!originalPosition) {
      console.error(`Position with ID ${positionId} not found`);
      return;
    }

    const bookmark = this.set.bookmarks.filter(
      (item) => item.id === this.selectedBookmark
    );

    const { id, ...clonePosition } = originalPosition;

    const newClonePosition: IClonePosition = {
      ...clonePosition,
      bookmarkId: bookmark[0],
      createdBy: { id: this.userId } as IUser,
      updatedBy: { id: this.userId } as IUser,
      setId: { id: +this.setId } as ISet,
    };

    this.editSetService
      .clonePosition(this.authorizationToken, newClonePosition)
      .subscribe({
        next: (response) => {
          this.resetFooter();

          // put new position in place according to property kolejnosc
          this.formData.splice(response.kolejnosc, 0, response);

          this.formData = this.formData
            .map((item: IPosition) => {
              const brutto = calculateBrutto(item.netto);

              return {
                ...item,
                brutto,
                wartoscNetto: calculateWartosc(item.ilosc, item.netto),
                wartoscBrutto: calculateWartosc(item.ilosc, brutto),
              };
            })
            .map((item: IPosition) => {
              this.calculateFooterRow(item);
              return item;
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
    this.isEdited = true;
    this.resetFooter();

    this.formData = this.formData
      .filter((item) => item.id !== positionId)
      .map((item: IPosition) => {
        this.calculateFooterRow(item);
        return item;
      });

    this.positions = this.positions
      .filter((item) => item.id !== positionId)
      .map((item: IPosition) => {
        return item;
      });

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

    this.set.status = this.setStatus;
    this.set.name = this.setName;

    if (this.authorizationToken && this.userId) {
      const savedSet: IUpdateSet = {
        userId: this.userId,
        set: this.set,
        positions: this.positions,
        positionToDelete: this.positionToDelete,
      };

      this.editSetService.saveSet(this.authorizationToken, savedSet).subscribe({
        next: (response) => {
          this.isEdited = false;
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
    } else {
      this.notificationService.showNotification('error', 'Brak autoryzacji.');
    }
  }

  // resize column event - save new column width to this.set.bookmark property
  onColResize(event: TableColResizeEvent) {
    this.isEdited = true;

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

  // hide dialog with edit header
  hideDialog() {
    this.editHeaderDialog = false;
    this.submitted = false;
  }

  // set header data change
  onSetHeaderChange(headerData: ISetHeader) {
    const originalMap = new Map(
      this.set.bookmarks.map((item: IBookmark) => [item.id, item])
    );

    this.set.bookmarks = headerData.selectedBookmarks.map(
      (item: IBookmark) => ({
        ...item,
        width: originalMap.get(item.id)?.width || bookarksDefaultWidth,
      })
    );
    this.updateBookmarks();

    this.setName = headerData.name;
    this.setStatus = headerData.selectedStatus;
    this.notificationService.showNotification(
      'info',
      'Nagłówek zestawienia został zmieniony'
    );

    this.isEdited = true;
  }

  // when upload image from clipboard
  onImageUpload = (imageName: string, positionId: string) => {
    this.isEdited = true;

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
    this.isEdited = true;
    this.updateOrder();
  }

  // update kolejnosc property on selected bookmark
  updateOrder() {
    this.formData = this.formData.map((item: IPosition, index: number) => {
      return { ...item, kolejnosc: index + 1 };
    });
  }
}
