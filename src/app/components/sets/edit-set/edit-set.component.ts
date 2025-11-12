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
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { CanComponentDeactivate } from '../../../guards/unsaved-changes.guard';
import { ConfirmationModalService } from '../../../services/confirmation.service';
import { NotificationService } from '../../../services/notification.service';
import { IConfirmationMessage } from '../../../services/types/IConfirmationMessage';
import { calculateWartosc } from '../../../shared/helpers/calculate';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { IBookmark } from '../../bookmarks/IBookmark';
import { IComment } from '../../comments/types/IComment';
import { IFileFullDetails } from '../../files/types/IFileFullDetails';
import { ISupplier } from '../../suppliers/ISupplier';
import { LegendComponent } from '../legend/legend.component';
import { PositionsTableComponent } from '../positions-table/positions-table.component';
import { SetMenuComponent } from '../set-menu/set-menu.component';
import { SummaryComponent } from '../summary/summary.component';
import { IPosition } from '../types/IPosition';
import { ISet } from '../types/ISet';
import { IUpdateSet } from '../types/IUpdateSet';
import { EditSetService } from './edit-set.service';

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
    InputTextModule,
    LoadingSpinnerComponent,
    PositionsTableComponent,
    TooltipModule,
    SetMenuComponent,
    SelectModule,
    FormsModule,
    SummaryComponent,
    LegendComponent,
  ],
})
export class EditSetComponent
  implements OnInit, CanComponentDeactivate, AfterViewInit
{
  setId!: number;
  set!: ISet;
  positions: IPosition[] = [];
  positionsFromBookmark: IPosition[] = [];
  latestFormData: IPosition[] = [];
  selectedBookmark: number = 0;
  selectedBookmarks: IBookmark[] = [];
  pendingNavigation: Function | null = null;
  destination: string | undefined;
  isLoading = true;
  setIsDirty = false;
  allSuppliers: ISupplier[] = [];
  menuItems: MenuItem[] = [];
  @ViewChild(SetMenuComponent) setMenuComponent!: SetMenuComponent;

  @ViewChild(PositionsTableComponent)
  positionsTableComponent?: PositionsTableComponent;
  positionToDelete = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private confirmationModalService: ConfirmationModalService,
    private editSetService: EditSetService,
    private notificationService: NotificationService,
    private cd: ChangeDetectorRef
  ) {}

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

        this.isLoading = false;

        if (set.bookmarks.length > 0) {
          this.updateBookmarks();
        }
      },
      error: (err) => console.error('Error loading data', err),
    });
  }

  // change state of set - mark as edited or not edited
  isEdited(state: boolean) {
    this.setIsDirty = state;
    this.setMenuComponent.updateMenuItems();
    this.cd.markForCheck();
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

  // update files list after upload new files
  updateFileList(newFiles: IFileFullDetails[]) {
    this.set.files = [...(this.set.files || []), ...newFiles];
  }

  // save data
  onSubmit() {
    if (this.positionsTableComponent) {
      this.latestFormData = this.positionsTableComponent?.formData;
    }
    this.updatePositions();

    // need extract status.label from status object to save in DB
    const updatedPositions = this.positions.map((item: any) => ({
      ...item,
      status: item.status?.label || item.status,
    }));

    const savedSet: IUpdateSet = {
      set: this.set,
      positions: updatedPositions,
      positionToDelete: [...this.positionToDelete],
    };

    this.editSetService.saveSet(savedSet).subscribe({
      next: (response) => {
        this.isEdited(false);
        this.positionToDelete.clear();

        if (this.positionsTableComponent) {
          this.positionsTableComponent.positionToDelete = [];
        }
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

  // load positions for a given bookmarkID
  loadContentForBookmark(bookmarkId: number) {
    this.updatePositions();

    this.selectedBookmark = bookmarkId;

    this.positionsFromBookmark = [];
    this.positionsFromBookmark = this.positions
      .filter(
        (item) =>
          item.bookmarkId?.id === this.selectedBookmark &&
          !this.positionsTableComponent?.positionToDelete.includes(item.id)
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

    this.cd.detectChanges();

    setTimeout(() => {
      if (this.positionsTableComponent) {
        this.positionsTableComponent.initializeForm();
      }
    }, 0);
  }

  // update comments for set, and count newComments property for badge
  updateCommentsForSet(commentsFromSelectedBookmark: IComment[]) {
    const allComments: IComment[] = [];
    this.positions = this.positions.map((item: IPosition) => {
      const commentsByPositionId = commentsFromSelectedBookmark.filter(
        (comment) => comment.positionId.id === item.id
      );

      if (commentsByPositionId.length > 0) {
        allComments.push(...commentsByPositionId);
        return { ...item, comments: commentsByPositionId };
      } else if (item.comments && item.comments.length !== 0) {
        allComments.push(...item.comments);
      }

      return { ...item };
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

  // take edited data from form and update this.position array
  updatePositions(): void {
    if (this.positionsTableComponent) {
      this.latestFormData = this.positionsTableComponent.formData;
      this.positionsTableComponent.positionToDelete.forEach((n) =>
        this.positionToDelete.add(n)
      );
    }

    if (this.positionsTableComponent?.newOrClonePosition) {
      this.positions.push(this.positionsTableComponent.newOrClonePosition);
      this.positionsTableComponent.newOrClonePosition = undefined;
    }

    this.positions = this.editSetService.updatePosition(
      this.positions,
      this.latestFormData,
      this.positionToDelete
    );

    this.positionsTableComponent?.updateFooter();
  }

  // prevent from exit when form was edited
  canDeactivate(destination?: string): Promise<boolean> {
    if (this.setIsDirty) {
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
}
