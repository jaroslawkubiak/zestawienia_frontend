import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { forkJoin, map, switchMap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  calculateBrutto,
  calculateWartosc,
} from '../../../shared/helpers/calculate';
import { countNewComments } from '../../../shared/helpers/countNewComments';
import { IComment } from '../../comments/types/IComment';
import { ICommentsBadge } from '../../comments/types/ICommentBadge';
import { SendFilesComponent } from '../../files/send-files/send-files.component';
import { ShowFilesComponent } from '../../files/show-files/show-files.component';
import { EFileDirectoryList } from '../../files/types/file-directory-list.enum';
import { IFileFullDetails } from '../../files/types/IFileFullDetails';
import { EditSetService } from '../../sets/edit-set/edit-set.service';
import { PositionStatusList } from '../../sets/PositionStatusList';
import { SummaryComponent } from '../../sets/summary/summary.component';
import { IPosition } from '../../sets/types/IPosition';
import { IPositionStatus } from '../../sets/types/IPositionStatus';
import { IPositionWithBadge } from '../../sets/types/IPositionWithBadge';
import { ISet } from '../../sets/types/ISet';
import { ProductComponent } from './product/product.component';

@Component({
  selector: 'app-for-client',
  imports: [
    CommonModule,
    TooltipModule,
    SendFilesComponent,
    ShowFilesComponent,
    BadgeModule,
    TabsModule,
    SummaryComponent,
    ProductComponent,
  ],
  templateUrl: './for-client.component.html',
  styleUrl: './for-client.component.css',
})
export class ForClientComponent implements OnInit {
  setId: number | null = null;
  setHash: string | null = null;
  clientHash: string | null = null;
  set!: ISet;
  positions: IPosition[] = [];
  positionsWithBadge: IPositionWithBadge[] = [];
  positionsFromBookmark: IPositionWithBadge[] = [];
  uniquePositionIds: number[] = [];
  files: IFileFullDetails[] = [];
  FILES_URL = environment.FILES_URL;
  selectedBookmarkId = 0;
  mobileMenuOpen = false;
  mobileMenuClosing = false;

  @ViewChild(ShowFilesComponent) dialogShowFilesComponent!: ShowFilesComponent;
  @ViewChild(SendFilesComponent) dialogSendFilesComponent!: SendFilesComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private editSetService: EditSetService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((params) => ({
          setHash: params.get('setHash'),
          clientHash: params.get('clientHash'),
        })),
        switchMap(({ setHash, clientHash }) => {
          if (!setHash || !clientHash) {
            return throwError(() => new Error('Invalid params'));
          }
          return this.editSetService.validateSetAndHashForClient(
            setHash,
            clientHash,
          );
        }),
      )
      .subscribe({
        next: (response) => {
          if (response.setId) {
            this.setId = response.setId;
            this.loadData();
          } else {
            this.router.navigate(['/notfound']);
          }
        },
        error: () => this.router.navigate(['/notfound']),
      });
  }

  loadData() {
    if (this.setId === null) return;

    forkJoin({
      set: this.editSetService.getSet(this.setId),
      positions: this.editSetService.getPositions(this.setId),
    }).subscribe(({ set, positions }) => {
      this.set = set;

      this.positions = positions.map((pos) => {
        const statusObj: IPositionStatus =
          PositionStatusList.find(
            (statusItem) => pos.status === statusItem.label,
          ) || PositionStatusList[0];

        const brutto = calculateBrutto(pos.netto);

        return {
          ...pos,
          status: statusObj,
          brutto,
          wartoscNetto: calculateWartosc(pos.ilosc, pos.netto),
          wartoscBrutto: calculateWartosc(pos.ilosc, brutto),
          imageUrl: pos.image
            ? [
                this.FILES_URL,
                'sets',
                this.setId,
                this.set.hash,
                'positions',
                pos.id,
                pos.image,
              ].join('/')
            : '',
        };
      });

      this.assignCommentsToPosition();

      this.selectedBookmarkId = this.set.bookmarks[0].id;
      this.loadContentForBookmark(this.selectedBookmarkId);

      this.files = (this.set.files || []).filter(
        (item) => item.dir !== EFileDirectoryList.working,
      );

      this.uniquePositionIds = [
        ...new Set(this.set.comments?.map((c) => c.positionId?.id)),
      ];
    });
  }

  assignCommentsToPosition() {
    const map =
      this.set.comments?.reduce(
        (acc, comment) => {
          const id = comment.positionId?.id;
          if (!acc[id]) acc[id] = [];
          acc[id].push(comment);
          return acc;
        },
        {} as Record<number, IComment[]>,
      ) || {};

    this.positionsWithBadge = this.positions.map((position) => {
      const relatedComments = map[position.id] || [];
      const newComments = countNewComments(relatedComments, 'user');

      return {
        ...position,
        comments: relatedComments,
        newComments,
        commentsBadge: this.buildCommentsBadge({
          ...position,
          comments: relatedComments,
          newComments,
        }),
      };
    });
  }

  loadContentForBookmark(bookmarkId: number) {
    this.selectedBookmarkId = bookmarkId;

    this.positionsFromBookmark = this.positionsWithBadge
      .filter((p) => p.bookmarkId?.id === bookmarkId)
      .sort((a, b) => a.kolejnosc - b.kolejnosc)
      .map((p, index) => ({
        ...p,
        kolejnosc: index + 1,
      }));

    this.cd.detectChanges();
  }

  private buildCommentsBadge(pos: IPosition): ICommentsBadge {
    const newCount = pos.newComments ?? 0;
    const allCount = pos.comments?.length ?? 0;

    return {
      value: newCount || allCount,
      severity: newCount ? 'danger' : allCount ? 'contrast' : 'secondary',
      tooltip: newCount ? 'Ilość nowych komentarzy' : 'Ilość komentarzy',
    };
  }

  showAttachedFiles() {
    this.dialogShowFilesComponent.showDialog({
      id: this.set.id,
      hash: this.set.hash,
      name: this.set.name,
      files: this.files,
    } as ISet);
  }

  openSendFilesDialog(setId: number, setHash: string, setName: string) {
    this.dialogSendFilesComponent.openSendFilesDialog(setId, setHash, setName);
  }

  get filesCount(): number {
    const files =
      this.files.filter((file) => file.dir !== EFileDirectoryList.working) ??
      [];

    return files.length;
  }

  get filesSeverity(): 'contrast' | 'secondary' {
    return this.filesCount === 0 ? 'secondary' : 'contrast';
  }

  toggleMobileMenu() {
    if (this.mobileMenuOpen) {
      this.mobileMenuClosing = true;

      setTimeout(() => {
        this.mobileMenuOpen = false;
        this.mobileMenuClosing = false;
      }, 300); // MUSI = czas animacji
    } else {
      this.mobileMenuOpen = true;
    }
  }

  // update attached files after sending new files to server
  updateAttachedFiles(uploadedFiles: IFileFullDetails[]) {
    this.files = [...(this.set.files || []), ...uploadedFiles];
    this.filesCount;
  }

  commentsUpdated() {
    if (!this.setId) return;

    this.editSetService.getSet(this.setId).subscribe({
      next: (updatedSet) => {
        this.set = updatedSet;

        const map =
          this.set.comments?.reduce(
            (acc, comment) => {
              const id = comment.positionId?.id;
              if (!acc[id]) acc[id] = [];
              acc[id].push(comment);
              return acc;
            },
            {} as Record<number, IComment[]>,
          ) || {};

        this.positionsWithBadge = this.positionsWithBadge.map((p) => {
          const relatedComments = map[p.id] || [];
          const newCommentsCount = countNewComments(relatedComments, 'user');
          return {
            ...p,
            comments: relatedComments,
            newComments: newCommentsCount,
            commentsBadge: this.buildCommentsBadge({
              ...p,
              comments: relatedComments,
              newComments: newCommentsCount,
            }),
          };
        });

        this.positionsFromBookmark = this.positionsFromBookmark.map((p) => {
          const relatedComments = map[p.id] || [];
          const newCommentsCount = countNewComments(relatedComments, 'user');

          return {
            ...p,
            comments: relatedComments,
            newComments: newCommentsCount,
            commentsBadge: this.buildCommentsBadge({
              ...p,
              comments: relatedComments,
              newComments: newCommentsCount,
            }),
          };
        });

        this.cd.detectChanges();
      },
    });
  }
}
