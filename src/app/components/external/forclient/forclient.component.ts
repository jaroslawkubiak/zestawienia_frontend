import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { Dialog } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  calculateBrutto,
  calculateWartosc,
} from '../../../shared/helpers/calculate';
import { CommentsComponent } from '../../comments/comments.component';
import { IComment } from '../../comments/types/IComment';
import { IPositionWithComments } from '../../comments/types/IPositionWithComments';
import { SendFilesComponent } from '../../files/send-files/send-files.component';
import { ShowFilesComponent } from '../../files/show-files/show-files.component';
import { IFileFullDetails } from '../../files/types/IFileFullDetails';
import { EditSetService } from '../../sets/edit-set/edit-set.service';
import { PositionStatusList } from '../../sets/PositionStatusList';
import { SummaryComponent } from '../../sets/summary/summary.component';
import { LegendComponent } from '../../sets/legend/legend.component';
import { IPosition } from '../../sets/types/IPosition';
import { IPositionStatus } from '../../sets/types/IPositionStatus';
import { ISet } from '../../sets/types/ISet';

@Component({
  selector: 'app-setforclient',
  imports: [
    CommonModule,
    TooltipModule,
    SendFilesComponent,
    ShowFilesComponent,
    BadgeModule,
    Dialog,
    TabsModule,
    CommentsComponent,
    SummaryComponent,
    LegendComponent,
  ],
  templateUrl: './forclient.component.html',
  styleUrl: './forclient.component.css',
})
export class ForClientComponent implements OnInit {
  setId!: number;
  hash: string | null = null;
  set!: ISet;
  positions: IPosition[] = [];
  uniquePositionIds: number[] = [];
  files: IFileFullDetails[] = [];
  FILES_URL = environment.FILES_URL;
  selectedBookmark: number = 0;
  positionsFromBookmark: IPosition[] = [];
  showCommentsDialog = false;
  header = '';
  comments: IComment[] = [];
  positionId!: number;
  @ViewChild(ShowFilesComponent, { static: false })
  dialogShowFilesComponent!: ShowFilesComponent;
  @ViewChild(SendFilesComponent, { static: false })
  dialogSendFilesComponent!: SendFilesComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private editSetService: EditSetService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const setIdParam = params.get('id');
      this.hash = params.get('hash');

      if (setIdParam && this.hash) {
        const numericSetId = Number(setIdParam);

        // if setId not number - show not found
        if (isNaN(numericSetId)) {
          this.router.navigate(['/notfound']);
          return;
        }

        this.setId = numericSetId;

        this.editSetService
          .validateSetAndHashForClient(this.setId, this.hash)
          .subscribe({
            next: (response) => {
              if (!response) {
                this.router.navigate(['/notfound']);
              } else {
                this.loadData();
              }
            },
            error: (err) => {
              this.router.navigate(['/notfound']);
            },
          });
      } else {
        this.router.navigate(['/notfound']);
      }
    });
  }

  loadData() {
    forkJoin({
      set: this.editSetService.getSet(this.setId),
      positions: this.editSetService.getPositions(this.setId),
    }).subscribe(({ set, positions }) => {
      this.set = set;
      this.comments = this.set?.comments ?? [];
      this.positions = positions.map((item) => {
        const statusObj: IPositionStatus =
          PositionStatusList.filter(
            (statusItem) => item.status === statusItem.label
          )[0] || PositionStatusList[0];

        let imageUrl = '';
        if (item.image) {
          imageUrl = [
            this.FILES_URL,
            'sets',
            this.setId,
            'positions',
            item.id,
            item.image,
          ].join('/');
        }
        const brutto = calculateBrutto(item.netto);

        return {
          ...item,
          status: statusObj ? statusObj : item.status,
          brutto,
          wartoscNetto: calculateWartosc(item.ilosc, item.netto),
          wartoscBrutto: calculateWartosc(item.ilosc, brutto),
          imageUrl,
        };
      });

      // mark first (lowest id) bookmark as selected
      this.selectedBookmark = this.set.bookmarks[0].id;
      this.loadContentForBookmark(this.selectedBookmark);

      this.files = (this.set?.files || []).filter(
        (item) => item.dir !== 'robocze'
      );
      this.sortByBookmarkAndOrder(this.positions);

      this.uniquePositionIds = [
        ...new Set(this.comments.map((comment) => comment.positionId?.id)),
      ];

      this.assignCommentsToPosition();
    });
  }

  // load positions for a given bookmarkID
  loadContentForBookmark(bookmarkId: number) {
    this.selectedBookmark = bookmarkId;

    this.positionsFromBookmark = [];
    this.positionsFromBookmark = this.positions
      .filter((item) => item.bookmarkId?.id === this.selectedBookmark)
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
  }
  // sort position by bookmark id
  sortByBookmarkAndOrder(data: IPosition[]) {
    return data.sort((a, b) => {
      if (a.bookmarkId.id !== b.bookmarkId.id) {
        return a.bookmarkId.id - b.bookmarkId.id;
      }
      return a.kolejnosc - b.kolejnosc;
    });
  }

  // check date in pdf file name to download latest pdf file
  extractDateFromFilename(filename: string): Date {
    const match = filename.match(/(\d{2}-\d{2}-\d{4}-\d{2}-\d{2}-\d{2})/);
    if (!match)
      throw new Error(`Nie znaleziono daty w nazwie pliku: ${filename}`);

    const [day, month, year, hour, minute, second] = match[1]
      .split('-')
      .map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  }

  showAttachedFiles() {
    const preparedSet = { ...this.set, files: this.files };
    this.dialogShowFilesComponent.showDialog(preparedSet);
  }

  openSendFilesDialog(setId: number, setName: string) {
    this.dialogSendFilesComponent.openSendFilesDialog(setId, setName);
  }

  assignCommentsToPosition() {
    const positionCommentsMap = this.comments.reduce((map, comment) => {
      const positionId = comment.positionId?.id;
      if (!map[positionId]) {
        map[positionId] = [];
      }
      map[positionId].push(comment);
      return map;
    }, {} as Record<number, IComment[]>);

    this.positions = this.positions.map((position) => {
      const relatedComments = positionCommentsMap[position.id] || [];
      return {
        ...position,
        comments: relatedComments,
        newComments: this.countNewComments(relatedComments),
      };
    });
  }

  private countNewComments(comments: IComment[]): number {
    return comments.filter(
      (item) => item.authorType === 'user' && !item.readByReceiver
    ).length;
  }

  getRowNewComments(positionId: number): number {
    const position = this.positions.find((item) => item.id === positionId);

    return position?.newComments || 0;
  }

  getRowAllComments(positionId: number): number {
    const position = this.positions.find((item) => item.id === positionId);

    return position?.comments?.length || 0;
  }

  // show comment dialog
  showComments(positionId: number) {
    const position = this.positions.find((item) => item.id === positionId);

    if (position?.comments) {
      this.comments = position.comments;
      this.positionId = position.id;
      this.header = `Pozycja ${position.kolejnosc} ${
        position.produkt ? ' : ' + position.produkt : ''
      }`;
      this.showCommentsDialog = true;
    }
  }

  // update new comments when changing status
  onUpdateComments(updatedData: IPositionWithComments) {
    this.positions = this.positions.map((item) => {
      if (item.id === updatedData.positionId) {
        return {
          ...item,
          comments: updatedData.comments,
          newComments: this.countNewComments(updatedData.comments),
        };
      }
      return item;
    });
  }

  getStatusLabel(status: IPositionStatus | string): string {
    return typeof status === 'object' ? status?.label : '';
  }

  getStatusCss(status: IPositionStatus | string): string {
    return typeof status === 'object' ? status?.cssClass : '';
  }

  get filesCount(): number {
    const files =
      this.set?.files?.filter((file) => file.dir !== 'robocze') ?? [];

    return files.length;
  }

  get filesSeverity(): 'danger' | 'secondary' {
    return this.filesCount === 0 ? 'secondary' : 'danger';
  }
}
