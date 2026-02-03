import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { Dialog } from 'primeng/dialog';
import { MenubarModule } from 'primeng/menubar';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationService } from '../../../services/notification.service';
import { PdfService } from '../../../services/pdf.service';
import { calcCommentsBadgeSeverity } from '../../../shared/helpers/calcCommentsBadgeSeverity';
import { countCommentsBadgeValue } from '../../../shared/helpers/countCommentsBadgeValue';
import { bookarksDefaultColumnWidth } from '../../bookmarks/bookmarks-width';
import { IBookmarksWithTableColumns } from '../../bookmarks/types/IBookmarksWithTableColumns';
import { EmailsService } from '../../emails/email.service';
import { SendEmailComponent } from '../../emails/send-email/send-email.component';
import { IExternalLink } from '../../emails/types/IExternalLink';
import { ISendedEmailsFromDB } from '../../emails/types/ISendedEmailsFromDB';
import { SendFilesComponent } from '../../files/send-files/send-files.component';
import { ShowFilesComponent } from '../../files/show-files/show-files.component';
import { IFileFullDetails } from '../../files/types/IFileFullDetails';
import { IRemainingFiles } from '../../files/types/IRemainingFiles';
import { ISupplier } from '../../suppliers/types/ISupplier';
import { EditHeaderComponent } from '../edit-header/edit-header.component';
import { IPosition } from '../positions-table/types/IPosition';
import { ISet } from '../types/ISet';
import { ISetHeader } from '../types/ISetHeader';
import { SetStatus } from '../types/set-status.enum';
import { buildSetMenu } from './set-menu.config';
import { EditSetService } from '../edit-set/edit-set.service';

@Component({
  selector: 'app-set-menu',
  imports: [
    CommonModule,
    MenubarModule,
    Dialog,
    EditHeaderComponent,
    SendFilesComponent,
    ShowFilesComponent,
    TooltipModule,
    BadgeModule,
    SendEmailComponent,
  ],
  templateUrl: './set-menu.component.html',
  styleUrl: './set-menu.component.css',
  standalone: true,
})
export class SetMenuComponent implements OnChanges, OnInit {
  @Input() set!: ISet;
  @Input() positions!: IPosition[];
  @Input() allSuppliers: ISupplier[] = [];
  @Input() selectedBookmarks!: IBookmarksWithTableColumns[];
  @Input() isEdited: boolean = false;
  @Input() showAllComments: boolean = false;
  @Output() editStarted = new EventEmitter<void>();
  @Output() updateBookmarks = new EventEmitter<void>();
  @Output() showAllCommentsComponent = new EventEmitter<void>();

  @ViewChild(SendFilesComponent, { static: false })
  dialogSendFilesComponent!: SendFilesComponent;
  @ViewChild(ShowFilesComponent, { static: false })
  dialogShowFilesComponent!: ShowFilesComponent;
  showEmailTemplate = false;
  emailDialogOpenId = 0;
  currentSupplier?: ISupplier;
  editHeaderDialog = false;
  editHeaderProps!: ISetHeader;
  menuItems: MenuItem[] = [];
  suppliersFromSet: ISupplier[] = [];
  emailsList: ISendedEmailsFromDB[] = [];
  attachmentBadge: number = 0;
  clientHash = '';

  constructor(
    private notificationService: NotificationService,
    private emailsService: EmailsService,
    private pdfService: PdfService,
    private editSetService: EditSetService,
  ) {}

  ngOnInit() {
    this.getEmailsList();
    this.updateMenuItems();
    this.clientHash = this.set.clientId.hash;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.attachmentBadge = this.set?.files?.length || 0;

    if (this.set && this.positions?.length && this.allSuppliers?.length) {
      this.findUniqueSuppliers();
      this.updateMenuItems();
    }
  }

  // create and update menu if set is edited or number of unique supplier is changed
  updateMenuItems(): void {
    this.menuItems = buildSetMenu(
      {
        set: this.set,
        suppliersFromSet: this.suppliersFromSet,
        emailsList: this.emailsList,
        isEdited: this.isEdited,
        clientHash: this.clientHash,
        sendSetToClient: () => this.sendSetToClientViaEmail(),
        sendSetToSupplier: (supplier) =>
          this.sendSetToSupplierViaEmail(supplier),
        openLink: (type, hash) => this.openLink({ type, hash }),
        copyLink: (type, hash) => this.copyLink({ type, hash }),
        editHeader: () => this.editHeader(),
        generatePDF: () => this.generatePDF(),
        showAttachedFiles: () => this.showAttachedFiles(),
        openSendFilesDialog: () => this.openSendFilesDialog(),
        getCommentsBadgeSeverity: () => this.getCommentsBadgeSeverity(),
        getCommentsBadgeValue: () => this.getCommentsBadgeValue(),
        toggleShowAllComments: () => this.toggleShowAllComments(),
      },
      this.showAllComments,
    );
  }

  // calc comments badge color
  getCommentsBadgeSeverity(): string {
    const badgeSeverity = calcCommentsBadgeSeverity(this.set.newCommentsCount);

    return `p-badge-${badgeSeverity}`;
  }

  // calc comments badge value
  getCommentsBadgeValue(): number {
    return countCommentsBadgeValue(this.set.newCommentsCount);
  }

  // open edit set header dialog
  editHeader(): void {
    this.editHeaderProps = {
      name: this.set.name,
      address: this.set.address,
      selectedStatus: this.set.status,
      selectedBookmarks: this.selectedBookmarks,
    };
    this.editHeaderDialog = true;
  }

  // close edit set header dialog
  hideDialog(): void {
    this.editHeaderDialog = false;
  }

  // change data after set header
  onSetHeaderChange(headerData: ISetHeader): void {
    const originalMap = new Map(
      this.set.bookmarks.map((item: IBookmarksWithTableColumns) => [
        item.id,
        item,
      ]),
    );

    this.set.bookmarks = headerData.selectedBookmarks.map(
      (item: IBookmarksWithTableColumns) => ({
        ...item,
        columnWidth:
          originalMap.get(item.id)?.columnWidth || bookarksDefaultColumnWidth,
      }),
    );
    this.updateBookmarks.emit();

    this.set.name = headerData.name;
    this.set.address = headerData.address;
    this.set.status = headerData.selectedStatus;

    this.notificationService.showNotification(
      'info',
      'Nagłówek zestawienia został zmieniony',
    );
    this.editStarted.emit();
  }

  // open send files dialog
  openSendFilesDialog(): void {
    this.dialogSendFilesComponent.openSendFilesDialog(
      this.set.id,
      this.set.hash,
      this.set.name,
    );
  }

  // show attached files to set
  showAttachedFiles() {
    this.dialogShowFilesComponent.showDialog(this.set);
  }

  generatePDF(): void {
    this.pdfService.generatePDF(this.set, this.positions);
  }

  // send set link to client
  sendSetToClientViaEmail(): void {
    this.showEmailTemplate = true;
  }

  // send set link to supplier
  sendSetToSupplierViaEmail(supplierId: ISupplier): void {
    this.showEmailTemplate = true;
    this.currentSupplier = supplierId;
  }

  hideEmailDialog() {
    this.showEmailTemplate = false;

    // second auto status change - from inPreparation to sended
    if (this.set.status === SetStatus.inPreparation) {
      this.set.status = SetStatus.sended;

      this.editSetService.updateSetStatus(this.set).subscribe({
        next: (response) => {
          this.notificationService.showNotification(
            'info',
            `Status zestawienia został zmieniony na "${response.status}"`,
          );
        },
        error: (err) => {
          this.notificationService.showNotification(
            'error',
            'Nie udało się zmienić status zestawienia.\n' + err,
          );
        },
      });
    }
  }

  // show all comments from this set
  toggleShowAllComments() {
    this.showAllCommentsComponent.emit();
  }

  //update set file list
  updateAttachedFiles(files: IFileFullDetails[]): void {
    this.set.files = [...(this.set.files ?? []), ...files];
    this.updateMenuItems();
  }

  //delete
  onDeleteFile(remainingFiles: IRemainingFiles) {
    const deletedIds = new Set(remainingFiles.files.map((file) => file.id));

    this.set.files = (this.set.files ?? []).filter((file) =>
      deletedIds.has(file.id),
    );
    this.updateMenuItems();
  }

  // generate link for client or supplier
  private getLink(data: IExternalLink): string {
    const { hash, type } = data;

    return this.emailsService.createExternalLink(type, this.set.hash, hash);
  }

  // open link in new window
  openLink(data: IExternalLink) {
    const link = this.getLink(data);
    if (link) {
      window.open(link, '_blank');
    }
  }

  // copy link to clipboard
  copyLink(data: IExternalLink) {
    const link = this.getLink(data);
    if (!link) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(link)
        .then(() =>
          this.notificationService.showNotification(
            'info',
            'Link został skopiowany',
          ),
        )
        .catch(() => this.fallbackCopy(link));
    } else {
      this.fallbackCopy(link);
    }
  }

  private fallbackCopy(text: string) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    this.notificationService.showNotification('info', 'Link został skopiowany');
  }

  onEmailDialogOpen() {
    this.emailDialogOpenId++;

    this.currentSupplier = this.currentSupplier
      ? { ...this.currentSupplier }
      : undefined;
  }

  onEmailDialogClose() {
    this.currentSupplier = undefined;
  }

  get emailDialogHeader(): string {
    if (this.currentSupplier) {
      return `Nowa wiadomość e-mail dla dostawcy: ${this.currentSupplier.company}`;
    } else if (this.set?.clientId) {
      return `Nowa wiadomość e-mail dla klienta: ${this.set.clientId.firstName} ${this.set.clientId.lastName}`;
    } else {
      return 'Nowa wiadomość e-mail';
    }
  }

  uploadFinished(message: string) {
    this.notificationService.showNotification('info', message);
  }

  getEmailsList() {
    this.emailsService.getEmailBySetId(this.set.id).subscribe({
      next: (response) => {
        this.emailsList = response;
        this.updateMenuItems();
      },
    });
  }

  // find all unique supplier to show in menu
  findUniqueSuppliers(): void {
    const uniqueSupplierIds: number[] = [];

    this.positions.forEach((pos) => {
      const supplier = pos.supplierId;
      if (supplier && !uniqueSupplierIds.includes(supplier.id)) {
        uniqueSupplierIds.push(supplier.id);
      }
    });

    this.suppliersFromSet = this.allSuppliers.filter((supplier) =>
      uniqueSupplierIds.includes(supplier.id),
    );
  }

  // finding the last email date and the user sent to the client
  findLastEmailToClient() {
    const email = this.emailsList.find(
      (email: ISendedEmailsFromDB) =>
        email.client?.id === this.set.clientId?.id,
    );
    if (email) {
      return `${email.sendAt} - ${email.sendBy.name}`;
    }

    return 'Nie wysłano';
  }

  // finding the last email date and the user sent to the supplier
  findLastEmailToSupplier(supplierId: number) {
    const email = this.emailsList.find(
      (email: ISendedEmailsFromDB) => email.supplier?.id === supplierId,
    );
    if (email) {
      return `${email.sendAt} - ${email.sendBy.name}`;
    }

    return 'Nie wysłano';
  }
}
