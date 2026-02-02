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
import { SendFilesComponent } from '../../files/send-files/send-files.component';
import { ShowFilesComponent } from '../../files/show-files/show-files.component';
import { EFileDirectoryList } from '../../files/types/file-directory-list.enum';
import { IFileFullDetails } from '../../files/types/IFileFullDetails';
import { IRemainingFiles } from '../../files/types/IRemainingFiles';
import { BadgeSeverity } from '../../sets/action-btns/types/badgeSeverity.type';
import { IPosition } from '../../sets/positions-table/types/IPosition';
import { IPositionStatus } from '../../sets/positions-table/types/IPositionStatus';
import { PositionStatusList } from '../../sets/PositionStatusList';
import { SummaryComponent } from '../../sets/summary/summary.component';
import { ISet } from '../../sets/types/ISet';
import { IClientData } from '../for-supplier/types/IClientData';
import { ForClientService } from './for-client.service';
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
  clientHash: string | null = null;
  set!: ISet;
  positions: IPosition[] = [];
  positionsFromBookmark: IPosition[] = [];
  client!: IClientData;
  uniquePositionIds: number[] = [];
  files: IFileFullDetails[] = [];
  FILES_URL = environment.FILES_URL;
  selectedBookmarkId = 0;
  mobileMenuOpen = false;
  mobileMenuClosing = false;
  isMobileSticky = false;

  @ViewChild(ShowFilesComponent) dialogShowFilesComponent!: ShowFilesComponent;
  @ViewChild(SendFilesComponent) dialogSendFilesComponent!: SendFilesComponent;

  constructor(
    private forClientService: ForClientService,
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

          return this.forClientService.loadClientSetData(setHash, clientHash);
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

  modifyData(positions: IPosition[]) {
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
              this.set.id,
              this.set.hash,
              'positions',
              pos.id,
              pos.image,
            ].join('/')
          : '',
      };
    });

    this.selectedBookmarkId =
      this.set.lastUsedClientBookmark || this.set.bookmarks[0].id;

    this.loadContentForBookmark(this.selectedBookmarkId);

    this.files = (this.set.files || []).filter(
      (item) => item.dir !== EFileDirectoryList.working,
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
    this.forClientService
      .updateLastUsedClientBookmark(this.set.hash, bookmarkId)
      .subscribe({
        next: (response) => {
          this.set = { ...response };
        },
      });
    this.selectedBookmarkId = bookmarkId;

    this.positionsFromBookmark = this.positions
      .filter((p) => p.bookmarkId?.id === bookmarkId)
      .sort((a, b) => a.kolejnosc - b.kolejnosc)
      .map((p, index) => ({
        ...p,
        kolejnosc: index + 1,
      }));

    this.cd.detectChanges();
  }

  //TODO
  showAllComments() {
    //get request for all comments here
  }

  // update attached files after sending new files to server
  updateAttachedFiles(uploadedFiles: IFileFullDetails[]) {
    this.files = [...(this.set.files || []), ...uploadedFiles];
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

  onDeleteFile(remainingFiles: IRemainingFiles) {
    this.files = [...remainingFiles.files];
  }

  get filesCount(): number {
    return this.files.filter((f) => f.dir !== EFileDirectoryList.working)
      .length;
  }

  getCommentsBadgeSeverity(): BadgeSeverity {
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
      }, 300); // MUSI = czas animacji
    } else {
      this.mobileMenuOpen = true;
    }
  }
}
