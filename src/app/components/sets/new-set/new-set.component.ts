import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { NotificationService } from '../../../services/notification.service';
import { bookarksDefaultWidth } from '../../bookmarks/bookmarks-width';
import { BookmarksService } from '../../bookmarks/bookmarks.service';
import { IBookmark } from '../../bookmarks/IBookmark';
import { ClientsService } from '../../clients/clients.service';
import { IClient } from '../../clients/types/IClient';
import { SetsService } from '../sets.service';
import { INewSet } from '../types/INewSet';

@Component({
  selector: 'app-new-set',
  templateUrl: './new-set.component.html',
  styleUrls: ['./new-set.component.css', '../../../shared/css/basic.css'],
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
})
export class NewSetComponent implements OnInit {
  name: string = '';
  allClients: IClient[] = [];
  selectedClient = '';
  allBookmarks: IBookmark[] = [];
  selectedBookmarks: IBookmark[] = [];

  constructor(
    private bookmarksService: BookmarksService,
    private setsService: SetsService,
    private clientsService: ClientsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.getClients();
    this.getBookmarks();
  }

  getClients() {
    this.clientsService.getClients().subscribe({
      next: (data) => {
        this.allClients = data;
      },
      error: (err) => console.error('Error getting clients ', err),
    });
  }

  getBookmarks() {
    this.bookmarksService.getBookmarks().subscribe({
      next: (data) => {
        this.allBookmarks = data;
        this.selectedBookmarks = data.filter((item) => item.default);
      },
      error: (err) => console.error('Error getting bookmarks ', err),
    });
  }

  onSubmit(formData: NgForm) {
    const client = { ...formData.form.controls['client'].value };
    const bookmarksData = {
      ...formData.form.controls['bookmarks'].value,
    };

    const bookmarks: IBookmark[] = Object.values(bookmarksData);
    bookmarks.map((item: IBookmark) => {
      item.width = bookarksDefaultWidth;
      delete item.default;
    });

    const newSet: INewSet = {
      name: this.name,
      clientId: client.id,
      createdBy: 0,
      bookmarks,
    };

    this.setsService.addSet(newSet).subscribe({
      next: (response) => {
        this.notificationService.showNotification(
          'success',
          'Nowe zestawienie zostało dodane'
        );
      },
      error: (error) => {
        this.notificationService.showNotification('error', error.message);
      },
    });
  }
}
