import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { MenubarModule, Menubar } from 'primeng/menubar';
import { EditHeaderComponent } from '../edit-header/edit-header.component';
import { bookarksDefaultWidth } from '../../bookmarks/bookmarks-width';
import { IBookmark } from '../../bookmarks/IBookmark';
import { ISetHeader } from '../types/ISetHeader';
import { ISet } from '../types/ISet';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-set-menu',
  imports: [MenubarModule, Menubar, Dialog, EditHeaderComponent],
  templateUrl: './set-menu.component.html',
  styleUrl: './set-menu.component.css',
})
export class SetMenuComponent implements OnInit {
  @Input() menuItems: MenuItem[] = [];
  @Input() set!: ISet;
  @Input() selectedBookmarks!: IBookmark[];
  @Output() editStarted = new EventEmitter<void>();
  @Output() updateBookmarks = new EventEmitter<void>();
  editHeaderDialog = false;
  editHeaderProps: any;
  constructor(private notificationService: NotificationService) {}

  ngOnInit() {}

  editHeader() {
    this.editHeaderProps = {
      name: this.set.name,
      selectedStatus: this.set.status,
      selectedBookmarks: this.selectedBookmarks,
    };
    this.editHeaderDialog = true;
  }

  hideDialog() {
    this.editHeaderDialog = false;
  }

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
}
