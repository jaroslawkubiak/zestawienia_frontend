import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { Menubar, MenubarModule } from 'primeng/menubar';
import { EmailService } from '../../../services/email.service';
import { NotificationService } from '../../../services/notification.service';
import { PdfService } from '../../../services/pdf.service';
import { IFileList } from '../../../services/types/IFileList';
import { bookarksDefaultWidth } from '../../bookmarks/bookmarks-width';
import { IBookmark } from '../../bookmarks/IBookmark';
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
    MenubarModule,
    Menubar,
    Dialog,
    EditHeaderComponent,
    SendFilesComponent,
    ShowFilesComponent,
  ],
  templateUrl: './set-menu.component.html',
  styleUrl: './set-menu.component.css',
})
export class SetMenuComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() set!: ISet;
  @Input() positions!: IPosition[];
  @Input() selectedBookmarks!: IBookmark[];
  @Output() editStarted = new EventEmitter<void>();
  @Output() updateBookmarks = new EventEmitter<void>();
  @ViewChild(SendFilesComponent, { static: false })
  dialogSendFilesComponent!: SendFilesComponent;
  @ViewChild(ShowFilesComponent, { static: false })
  dialogShowFilesComponent!: ShowFilesComponent;
  editHeaderDialog = false;
  editHeaderProps!: ISetHeader;
  constructor(
    private notificationService: NotificationService,
    private editSetService: EditSetService,
    private emailService: EmailService,
    private pdfService: PdfService
  ) {}

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
