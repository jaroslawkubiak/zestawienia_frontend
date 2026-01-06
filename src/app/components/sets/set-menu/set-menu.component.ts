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
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { Dialog } from 'primeng/dialog';
import { MenubarModule } from 'primeng/menubar';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationService } from '../../../services/notification.service';
import { PdfService } from '../../../services/pdf.service';
import { bookarksDefaultWidth } from '../../bookmarks/bookmarks-width';
import { IBookmark } from '../../bookmarks/IBookmark';
import { EmailSendComponent } from '../../emails/email-send/email-send.component';
import { EmailsService } from '../../emails/email.service';
import { IEmailsToSet } from '../../emails/types/IEmailsToSet';
import { SendFilesComponent } from '../../files/send-files/send-files.component';
import { ShowFilesComponent } from '../../files/show-files/show-files.component';
import { IDeletedFiles } from '../../files/types/IDeletedFiles';
import { IFileFullDetails } from '../../files/types/IFileFullDetails';
import { ISupplier } from '../../suppliers/ISupplier';
import { EditHeaderComponent } from '../edit-header/edit-header.component';
import { IExternalLink } from '../types/IExternalLink';
import { IPosition } from '../types/IPosition';
import { ISet } from '../types/ISet';
import { ISetHeader } from '../types/ISetHeader';
import { SetStatus } from '../types/set-status.enum';

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
    EmailSendComponent,
  ],
  templateUrl: './set-menu.component.html',
  styleUrl: './set-menu.component.css',
  standalone: true,
})
export class SetMenuComponent implements OnChanges, OnInit {
  @Input() set!: ISet;
  @Input() positions!: IPosition[];
  @Input() allSuppliers: ISupplier[] = [];
  @Input() selectedBookmarks!: IBookmark[];
  @Input() isEdited: boolean = false;
  @Output() editStarted = new EventEmitter<void>();
  @Output() updateBookmarks = new EventEmitter<void>();
  @Output() updateFileList = new EventEmitter<IFileFullDetails[]>();

  @ViewChild(SendFilesComponent, { static: false })
  dialogSendFilesComponent!: SendFilesComponent;
  @ViewChild(ShowFilesComponent, { static: false })
  dialogShowFilesComponent!: ShowFilesComponent;
  showEmailTemplate = false;
  currentSupplier!: ISupplier;
  editHeaderDialog = false;
  editHeaderProps!: ISetHeader;
  menuItems: MenuItem[] = [];
  suppliersFromSet: ISupplier[] = [];
  emailsList: IEmailsToSet[] = [];
  attachmentBadge: number = 0;
  clientHash = '';

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private emailsService: EmailsService,
    private pdfService: PdfService
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
      uniqueSupplierIds.includes(supplier.id)
    );
  }

  // finding the last email date and the user sent to the client
  findLastEmailToClient() {
    const email = this.emailsList.find(
      (email: IEmailsToSet) => email.clientId?.id === this.set.clientId?.id
    );
    if (email) {
      return `${email.sendAt} - ${email.sendBy.name}`;
    }

    return 'Nie wysłano';
  }

  // finding the last email date and the user sent to the supplier
  findLastEmailToSupplier(supplierId: number) {
    const email = this.emailsList.find(
      (email: IEmailsToSet) => email.supplierId?.id === supplierId
    );
    if (email) {
      return `${email.sendAt} - ${email.sendBy.name}`;
    }

    return 'Nie wysłano';
  }

  // create and update menu if set is edited or number of unique supplier is changed
  updateMenuItems(): void {
    const suppliersList: MenuItem[] = this.suppliersFromSet.map((supplier) => {
      return {
        label: `${supplier.company}`,
        icon: 'pi pi-truck',
        email: supplier.email,
        preview: () => this.openLink({ type: 'supplier', hash: supplier.hash }),
        copy: () => this.copyLink({ type: 'supplier', hash: supplier.hash }),
        previewTooltip: `Podgląd zestawienia dla ${supplier.company}`,
        previewCopyTooltip: `Kopiuj link dla ${supplier.company}`,
        sendAt: this.findLastEmailToSupplier(supplier.id),
        command: () => this.sendSetToSupplierViaEmail(supplier),
      };
    });

    this.menuItems = [
      {
        label: 'Edytuj nagłowek zestawienia',
        icon: 'pi pi-file-edit',
        command: () => this.editHeader(),
      },
      {
        label: 'Wyślij email',
        icon: 'pi pi-envelope',
        disabled: this.isEdited,
        items: [
          {
            label: `Do klienta`,
            icon: 'pi pi-user',
            email: this.set.clientId.email,
            preview: () =>
              this.openLink({ type: 'client', hash: this.clientHash }),
            copy: () =>
              this.copyLink({ type: 'client', hash: this.clientHash }),
            previewTooltip: 'Podgląd zestawienia dla klienta',
            previewCopyTooltip: 'Kopiuj link dla klienta',
            sendAt: this.findLastEmailToClient(),
            command: () => this.sendSetToClientViaEmail(),
          },
          {
            label: 'Do dostawców',
            icon: 'pi pi-users',
            badge: String(suppliersList.length),
            badgeStyleClass:
              suppliersList.length === 0
                ? 'p-badge-secondary'
                : 'p-badge-primary',
            items: suppliersList,
          },
        ],
      },
      {
        label: 'Stwórz PDF',
        icon: 'pi pi-file-pdf',
        disabled: this.isEdited,
        command: () => this.generatePDF(),
      },
      {
        label: 'Załączniki',
        icon: 'pi pi-cloud',
        badge: String(this.attachmentBadge),
        badgeStyleClass: this.attachmentBadge
          ? 'p-badge-contrast'
          : 'p-badge-secondary',
        command: () => this.showAttachedFiles(),
      },
      {
        label: 'Prześlij pliki',
        icon: 'pi pi-paperclip',
        command: () => this.openSendFilesDialog(),
      },
      {
        label: 'Komentarze',
        icon: 'pi pi-comments',
        badgeStyleClass: this.getCommentsBadgeClass(),
        badge: String(this.set?.newComments || this.set?.comments?.length || 0),
        command: () => this.showComments(),
      },
    ];
  }

  // define comments badge color
  getCommentsBadgeClass(): string {
    const commentsCount = this.set?.comments?.length ?? 0;
    const newComments = this.set?.newComments ?? 0;

    if (newComments > 0) {
      return 'p-badge-danger';
    }

    if (commentsCount > 0) {
      return 'p-badge-contrast';
    }

    return 'p-badge-secondary';
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
      this.set.bookmarks.map((item: IBookmark) => [item.id, item])
    );

    this.set.bookmarks = headerData.selectedBookmarks.map(
      (item: IBookmark) => ({
        ...item,
        width: originalMap.get(item.id)?.width || bookarksDefaultWidth,
      })
    );
    this.updateBookmarks.emit();

    this.set.name = headerData.name;
    this.set.address = headerData.address;
    this.set.status = headerData.selectedStatus;

    this.notificationService.showNotification(
      'info',
      'Nagłówek zestawienia został zmieniony'
    );
    this.editStarted.emit();
  }

  // open send files dialog
  openSendFilesDialog(): void {
    this.dialogSendFilesComponent.openSendFilesDialog(
      this.set.id,
      this.set.hash,
      this.set.name
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
    this.set.status = SetStatus.sended;
  }

  // show all comments from this set
  showComments() {
    const backPath = `/sets/${this.set.id}`;

    this.router.navigate([`/sets/comments/${this.set.id}`], {
      state: { backPath },
    });
  }

  //update set file list
  updateAttachedFiles(files: IFileFullDetails[]): void {
    const currentFileCount = this.set?.files?.length || 0;
    this.attachmentBadge = currentFileCount + files.length;
    this.updateMenuItems();
    this.updateFileList.emit(files);
  }

  //delete
  onDeleteFile(deletedFiles: IDeletedFiles) {
    const { files } = deletedFiles;
    this.attachmentBadge = files.length;
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
            'Link został skopiowany'
          )
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
}
