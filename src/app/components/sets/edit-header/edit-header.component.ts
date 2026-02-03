import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { BookmarksService } from '../../bookmarks/bookmarks.service';
import { IBookmarksWithTableColumns } from '../../bookmarks/types/IBookmarksWithTableColumns';
import { ISetHeader } from '../types/ISetHeader';
import { ISetStatus } from '../types/ISetStatus';
import { SetStatus } from '../types/set-status.enum';

@Component({
  selector: 'app-edit-header',
  templateUrl: './edit-header.component.html',
  styleUrls: ['./edit-header.component.css', '../../../shared/css/basic.css'],
  standalone: true,
  imports: [
    FormsModule,
    SelectModule,
    CheckboxModule,
    CommonModule,
    ButtonModule,
    TextareaModule,
    InputTextModule,
    LoadingSpinnerComponent,
  ],
  providers: [MessageService],
})
export class EditHeaderComponent implements OnInit {
  @Input() editHeader!: ISetHeader;
  name: string = '';
  address: string = '';
  selectedStatus: string = '';
  selectedBookmarks: IBookmarksWithTableColumns[] = [];
  allBookmarks: IBookmarksWithTableColumns[] = [];
  setStatus: string = '';
  isLoading = true;
  statuses: ISetStatus[] = Object.entries(SetStatus).map(([key, value]) => ({
    name: key,
    label: value,
  }));
  @Output() setHeaderChange = new EventEmitter<ISetHeader>();
  @Output() closeModal = new EventEmitter<void>();

  constructor(private bookmarksService: BookmarksService) {}

  ngOnInit() {
    this.getBookmarks();
    this.name = this.editHeader.name;
    this.address = this.editHeader.address;
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
        this.isLoading = false;
      },
      error: (err) => console.error('Error getting bookmarks ', err),
    });
  }
  
  save() {
    const newHeader: ISetHeader = {
      name: this.name,
      address: this.address,
      selectedStatus: this.selectedStatus,
      selectedBookmarks: this.selectedBookmarks,
    };

    this.setHeaderChange.emit(newHeader);
    this.closeModal.emit();
  }
}
