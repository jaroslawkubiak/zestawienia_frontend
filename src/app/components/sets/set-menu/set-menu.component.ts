import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
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
import { IFileList } from '../../files/types/IFileList';
import { ISupplier } from '../../suppliers/types/ISupplier';
import { EditHeaderComponent } from '../edit-header/edit-header.component';
import { EditSetService } from '../edit-set/edit-set.service';
import { IPosition } from '../types/IPosition';
import { ISet } from '../types/ISet';
import { ISetHeader } from '../types/ISetHeader';

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
export class SetMenuComponent {
  @Input() set!: ISet;
  @Input() positions!: IPosition[];
  @Input() allSuppliers: ISupplier[] = [];
  @Input() selectedBookmarks!: IBookmark[];
  @Input() isEdited: boolean = false;
  @Output() editStarted = new EventEmitter<void>();
  @Output() updateBookmarks = new EventEmitter<void>();

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

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private editSetService: EditSetService,
    private emailsService: EmailsService,
    private pdfService: PdfService,
  ) {}

  ngOnInit() {
    this.getEmailsList();
  }

  ngOnChanges(changes: SimpleChanges): void {
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
        label: `${supplier.firma}`,
        icon: 'pi pi-truck',
        email: supplier.email,
        sendAt: this.findLastEmailToSupplier(supplier.id),
        command: () => this.sendSetToSupplierViaEmail(supplier),
      };
    });

    this.menuItems = [
      {
        description: 'To jest opis edytowania nagłówka',
        label: 'Edytuj nagłówek',
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
            sendAt: this.findLastEmailToClient(),
            command: () => this.sendSetToClientViaEmail(),
          },
          {
            label: 'Do dostawców',
            icon: 'pi pi-users',
            badge: String(suppliersList.length),
            badgeStyleClass:
              suppliersList.length === 0 ? 'p-badge-danger' : 'p-badge-primary',
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
        icon: 'pi pi-paperclip',
        command: () => this.showAttachedFiles(),
      },
      {
        label: 'Prześlij pliki',
        icon: 'pi pi-upload',
        command: () => this.openSendFilesDialog(),
      },
      {
        label: 'Komentarze',
        icon: 'pi pi-comments',
        badgeStyleClass: this.set.newComments
          ? 'p-badge-danger'
          : 'p-badge-contrast',
        badge: this.set.newComments
          ? String(this.set.newComments)
          : String(this.set?.comments?.length),
        command: () => this.showComments(),
      },
    ];
  }

  // open edit set header dialog
  editHeader(): void {
    this.editHeaderProps = {
      name: this.set.name,
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
      this.set.name
    );
  }

  // show attached files to set
  showAttachedFiles() {
    this.editSetService.getSetFiles(this.set.id).subscribe({
      next: (response: IFileList) => {
        this.dialogShowFilesComponent.showDialog(
          this.set.id,
          this.set.name,
          response
        );
      },
    });
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
  }

  // show all comments from this set
  showComments() {
    const backPath = `/sets/${this.set.id}`;

    this.router.navigate([`/sets/comments/${this.set.id}`], {
      state: { backPath },
    });
  }
}
