import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { BookmarksService } from '../../bookmarks/bookmarks.service';
import { IBookmark } from '../../bookmarks/IBookmark';
import { ISetHeader } from '../types/ISetHeader';
import { IStatus, SetStatus } from '../types/status';

@Component({
  selector: 'app-edit-header',
  templateUrl: './edit-header.component.html',
  styleUrls: ['./edit-header.component.css', '../../../shared/css/basic.css'],
  standalone: true,
  imports: [
    ToastModule,
    FormsModule,
    SelectModule,
    CheckboxModule,
    CommonModule,
    ButtonModule,
    InputTextModule,
  ],
  providers: [MessageService],
})
export class EditHeaderComponent implements OnInit {
  @Input() editHeader!: ISetHeader;
  name: string = '';
  selectedStatus: string = '';
  selectedBookmarks: IBookmark[] = [];
  allBookmarks: IBookmark[] = [];
  setStatus: string = '';
  statuses: IStatus[] = Object.entries(SetStatus).map(([key, value]) => ({
    name: key,
    label: value,
  }));
  @Output() setHeaderChange = new EventEmitter<ISetHeader>();
  @Output() closeModal = new EventEmitter<void>();

  constructor(private bookmarksService: BookmarksService) {}

  ngOnInit() {
    this.getBookmarks();
    this.name = this.editHeader.name;
    this.selectedStatus = this.editHeader.selectedStatus;
    this.selectedBookmarks = this.editHeader.selectedBookmarks;
  }
  getBookmarks() {
    this.bookmarksService.getBookmarks().subscribe({
      next: (data) => {
        this.allBookmarks = data.map((bookmark) => ({
          ...bookmark,
          default: true,
        }));
      },
      error: (err) => console.error('Error getting bookmarks ', err),
    });
  }
  save() {
    const newHeader: ISetHeader = {
      name: this.name,
      selectedStatus: this.selectedStatus,
      selectedBookmarks: this.selectedBookmarks,
    };

    this.setHeaderChange.emit(newHeader);
    this.closeModal.emit();
  }
}
