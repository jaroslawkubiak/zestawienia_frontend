import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { Dialog } from 'primeng/dialog';
import { MenubarModule } from 'primeng/menubar';
import { TooltipModule } from 'primeng/tooltip';
import { EmailService } from '../../../services/email.service';
import { NotificationService } from '../../../services/notification.service';
import { PdfService } from '../../../services/pdf.service';
import { IFileList } from '../../../services/types/IFileList';
import { bookarksDefaultWidth } from '../../bookmarks/bookmarks-width';
import { IBookmark } from '../../bookmarks/IBookmark';
import { ISupplier } from '../../suppliers/types/ISupplier';
import { EditHeaderComponent } from '../edit-header/edit-header.component';
import { EditSetService } from '../edit-set/edit-set.service';
import { SendFilesComponent } from '../send-files/send-files.component';
import { ShowFilesComponent } from '../show-files/show-files.component';
import { IPosition } from '../types/IPosition';
import { ISet } from '../types/ISet';
import { ISetHeader } from '../types/ISetHeader';
import { SetStatus } from '../types/SetStatus';

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
  ],
  templateUrl: './set-menu.component.html',
  styleUrl: './set-menu.component.css',
})
export class SetMenuComponent {
  @Input() set!: ISet;
  @Input() positions!: IPosition[];
  @Input() allSuppliers: ISupplier[] = [];
  @Input() selectedBookmarks!: IBookmark[];
  @Output() editStarted = new EventEmitter<void>();
  @Output() updateBookmarks = new EventEmitter<void>();

  @ViewChild(SendFilesComponent, { static: false })
  dialogSendFilesComponent!: SendFilesComponent;
  @ViewChild(ShowFilesComponent, { static: false })
  dialogShowFilesComponent!: ShowFilesComponent;
  editHeaderDialog = false;
  editHeaderProps!: ISetHeader;
  menuItems: MenuItem[] = [];
  suppliersFromSet: ISupplier[] = [];
  @Input() isEdited: boolean = false;

  constructor(
    private notificationService: NotificationService,
    private editSetService: EditSetService,
    private emailService: EmailService,
    private pdfService: PdfService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.set && this.positions?.length && this.allSuppliers?.length) {
      this.findUniqueSuppliers();
      this.updateMenuItems();
    }
  }

  findUniqueSuppliers() {
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

  updateMenuItems() {
    const suppliersList: { label: string; icon: string }[] =
      this.suppliersFromSet.map((supplier) => {
        return {
          label: `${supplier.firma}<br/><strong>${supplier.email}</strong>`,
          icon: 'pi pi-truck',
        };
      });

    this.menuItems = [
      {
        label: 'Edytuj nagłówek',
        icon: 'pi pi-file-edit',
        command: () => this.editHeader(),
      },
      {
        label: 'Wyślij email',
        icon: 'pi pi-envelope',
        subtitle: '7 nieprzeczytanych',
        items: [
          {
            label: `Do klienta - <strong>${this.set.clientId.email}</strong>`,
            icon: 'pi pi-user',
            command: () => this.sendSetToClientViaEmail(),
          },
          {
            label: 'Do dostawców',
            icon: 'pi pi-users',
            badge: String(suppliersList.length),
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
    ];
  }

  // open edit set header dialog
  editHeader() {
    this.editHeaderProps = {
      name: this.set.name,
      selectedStatus: this.set.status,
      selectedBookmarks: this.selectedBookmarks,
    };
    this.editHeaderDialog = true;
  }

  // close edit set header dialog
  hideDialog() {
    this.editHeaderDialog = false;
  }

  // change data after set header
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
  openSendFilesDialog() {
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

  generatePDF() {
    this.pdfService.generatePDF(this.set, this.positions);
  }

  // send set link to client
  sendSetToClientViaEmail() {
    this.emailService.sendEmail(this.set.id).subscribe({
      next: (response) => {
        this.set.status = SetStatus.sended;
        this.notificationService.showNotification(
          'success',
          `Email na adres ${response.accepted[0]} został wysłany poprawnie`
        );
      },
      error: (error) => {
        const sendigError = error?.error?.message
          ? `${error.error.message} : ${error.error?.error}`
          : 'Nie udało się wysłać emaila.';
        this.notificationService.showNotification('error', sendigError);
      },
    });
  }
}
