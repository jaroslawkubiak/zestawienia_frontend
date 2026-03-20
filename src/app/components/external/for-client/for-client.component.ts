import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { map, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { calcCommentsBadgeSeverity } from '../../../shared/helpers/calcCommentsBadgeSeverity';
import { calcCommentsBadgeTooltip } from '../../../shared/helpers/calcCommentsBadgeTooltip';
import {
  calculateBrutto,
  calculateWartosc,
} from '../../../shared/helpers/calculate';
import { countCommentsBadgeValue } from '../../../shared/helpers/countCommentsBadgeValue';
import { IClient } from '../../clients/types/IClient';
import { IComment } from '../../comments/types/IComment';
import { IPositionWithComments } from '../../comments/types/IPositionWithComments';
import { SendFilesComponent } from '../../files/send-files/send-files.component';
import { ShowFilesComponent } from '../../files/show-files/show-files.component';
import { EFileDirectory } from '../../files/types/file-directory.enum';
import { IFileFullDetails } from '../../files/types/IFileFullDetails';
import { IRemainingFiles } from '../../files/types/IRemainingFiles';
import { IPosition } from '../../sets/positions-table/types/IPosition';
import { SummaryComponent } from '../../sets/summary/summary.component';
import { ISet } from '../../sets/types/ISet';
import { AvatarsComponent } from '../../settings/avatars/avatars.component';
import { IAvatar } from '../../settings/avatars/types/IAvatarList';
import { TBadgeSeverity } from '../../settings/types/badgeSeverity.type';
import { ExternalService } from '../external.service';
import { ProductComponent } from './product/product.component';
import { CONTENT_TOGGLE, ContentType } from './types/contentType';

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
    AvatarsComponent,
  ],
  templateUrl: './for-client.component.html',
  styleUrl: './for-client.component.css',
})
export class ForClientComponent implements OnInit {
  set!: ISet;
  positions: IPosition[] = [];
  positionsFromBookmark: IPosition[] = [];
  client!: IClient;
  uniquePositionIds: number[] = [];
  files: IFileFullDetails[] = [];
  FILES_URL = environment.FILES_URL;
  selectedBookmarkId = 0;
  mobileMenuOpen = false;
  mobileMenuClosing = false;
  isMobileSticky = false;
  positionsWithComments: IPositionWithComments[] = [];
  comments: IComment[] = [];
  contentToLoad: ContentType = 'set';

  @ViewChild(ShowFilesComponent) dialogShowFilesComponent!: ShowFilesComponent;
  @ViewChild(SendFilesComponent) dialogSendFilesComponent!: SendFilesComponent;

  constructor(
    private externalService: ExternalService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.innerWidth <= 768) {
      this.isMobileSticky = window.scrollY >= 400;
    }
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.route.paramMap
      .pipe(
        map((params) => ({
          setHash: params.get('setHash'),
          clientHash: params.get('clientHash'),
        })),
        switchMap(({ setHash, clientHash }) => {
          if (!setHash || !clientHash) {
            throw new Error('Invalid params');
          }

          return this.externalService.loadClientSetData(setHash, clientHash);
        }),
      )
      .subscribe({
        next: (response) => {
          if (response?.valid) {
            this.set = response.set;
            this.client = { ...response.set.clientId };

            this.modifyData(response.positions);
          } else {
            this.router.navigate(['/notfound']);
          }
        },
        error: () => this.router.navigate(['/notfound']),
      });
  }

  toggleContent() {
    this.contentToLoad = CONTENT_TOGGLE[this.contentToLoad];
  }

  modifyData(positions: IPosition[]) {
    this.positions = positions.map((position) => {
      const brutto = calculateBrutto(position.netto);
      const wartoscNetto = calculateWartosc(position.ilosc, position.netto);
      const wartoscBrutto = calculateWartosc(position.ilosc, brutto);

      const imageUrl = position.image ? this.joinImageUrl(position) : '';

      return {
        ...position,
        brutto,
        wartoscNetto,
        wartoscBrutto,
        imageUrl: imageUrl,
      };
    });

    this.selectedBookmarkId =
      this.set.lastActiveClientBookmarkId || this.set.bookmarks[0].id;

    this.loadContentForBookmark(this.selectedBookmarkId);

    this.files = (this.set.files || []).filter(
      (item) => item.dir !== EFileDirectory.WORKING,
    );

    this.uniquePositionIds = [
      ...new Set(this.set.comments?.map((c) => c.positionId)),
    ];
  }

  commentsUpdated() {
    if (!this.set) return;

    this.loadData();
  }

  loadContentForBookmark(bookmarkId: number) {
    this.contentToLoad = 'set';
    this.externalService
      .updateLastActiveClientBookmark(this.set.hash, bookmarkId)
      .subscribe({
        next: (response) => {
          this.set = {
            ...this.set,
            lastActiveClientBookmarkId: response.lastActiveClientBookmarkId,
          };

          this.selectedBookmarkId = bookmarkId;

          this.positionsFromBookmark = this.positions
            .filter((p) => p.bookmarkId?.id === bookmarkId)
            .sort((a, b) => a.kolejnosc - b.kolejnosc)
            .map((p, index) => ({
              ...p,
              kolejnosc: index + 1,
            }));

          this.cd.detectChanges();
        },
      });
  }

  assignCommentsToPosition() {
    this.positionsWithComments = this.uniquePositionIds.reduce<
      IPositionWithComments[]
    >((acc, positionId) => {
      const position = this.positions.find((p) => p.id === positionId);
      if (!position) return acc;

      if (position.bookmarkId.id === this.selectedBookmarkId) {
        acc.push({
          position,
          comments: this.comments.filter(
            (comment) => comment.positionId === positionId,
          ),
        });
      }

      return acc;
    }, []);

    this.cd.markForCheck();
  }

  updateAttachedFiles(uploadedFiles: IFileFullDetails[]) {
    this.files = [...(this.files || []), ...uploadedFiles];
  }

  showAttachedFiles() {
    this.dialogShowFilesComponent.showDialog({
      id: this.set.id,
      hash: this.set.hash,
      name: this.set.name,
      files: this.files,
    } as ISet);
  }

  getAvatarForComment(): string {
    return `${environment.FILES_URL}/${this.client.avatar?.path}/${this.client.avatar?.fileName}`;
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/avatars/default.png';
  }

  onSetNewAvatar(newAvatar: IAvatar) {
    this.client.avatar = newAvatar;
    this.set.clientId.avatar = newAvatar;
  }

  toggleAvatarComponent() {
    this.toggleContent();
  }

  openSendFilesDialog(setId: number, setHash: string, setName: string) {
    this.dialogSendFilesComponent.openSendFilesDialog(setId, setHash, setName);
  }

  onDeleteFile(remainingFiles: IRemainingFiles) {
    this.files = [...remainingFiles.files];
  }

  get filesCount(): number {
    return this.files.filter((f) => f.dir !== EFileDirectory.WORKING).length;
  }

  getCommentsBadgeSeverity(): TBadgeSeverity {
    return calcCommentsBadgeSeverity(this.set.newCommentsCount);
  }

  getCommentsBadgeValue(): number {
    return countCommentsBadgeValue(this.set.newCommentsCount);
  }

  getCommentsTooltipInfo(): string {
    return calcCommentsBadgeTooltip(this.set.newCommentsCount);
  }

  toggleMobileMenu() {
    if (this.mobileMenuOpen) {
      this.mobileMenuClosing = true;

      setTimeout(() => {
        this.mobileMenuOpen = false;
        this.mobileMenuClosing = false;
      }, 300);
    } else {
      this.mobileMenuOpen = true;
    }
  }

  private joinImageUrl(position: IPosition) {
    return [
      this.FILES_URL,
      'sets',
      this.set.id,
      this.set.hash,
      'positions',
      position.id,
      position.image,
    ].join('/');
  }
}
