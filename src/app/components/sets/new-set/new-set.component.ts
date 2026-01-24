import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { NotificationService } from '../../../services/notification.service';
import { bookarksDefaultWidth } from '../../bookmarks/bookmarks-width';
import { BookmarksService } from '../../bookmarks/bookmarks.service';
import { ClientsService } from '../../clients/clients.service';
import { IClient } from '../../clients/types/IClient';
import { SetsService } from '../sets.service';
import { INewSet } from '../types/INewSet';
import { IBookmarksWithTableColumns } from '../../bookmarks/types/IBookmarksWithTableColumns';

@Component({
  selector: 'app-new-set',
  templateUrl: './new-set.component.html',
  styleUrls: ['./new-set.component.css', '../../../shared/css/basic.css'],
  standalone: true,
  imports: [
    FormsModule,
    SelectModule,
    CheckboxModule,
    CommonModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
  ],
})
export class NewSetComponent implements OnInit {
  name: string = '';
  address: string = '';
  allClients: IClient[] = [];
  selectedClient = '';
  allBookmarks: IBookmarksWithTableColumns[] = [];
  selectedBookmarks: IBookmarksWithTableColumns[] = [];

  constructor(
    private bookmarksService: BookmarksService,
    private router: Router,
    private setsService: SetsService,
    private clientsService: ClientsService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.getClients();
    this.getBookmarks();
  }

  getClients() {
    this.clientsService.getClients().subscribe({
      next: (data) => {
        this.allClients = data.map((client) => ({
          ...client,
          fullName: `${client.firstName} ${client.lastName}`,
        }));
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

    const bookmarks: IBookmarksWithTableColumns[] =
      Object.values(bookmarksData);
    bookmarks.map((item: IBookmarksWithTableColumns) => {
      item.columnWidth = bookarksDefaultWidth;
      delete item.default;
    });

    const newSet: INewSet = {
      name: this.name,
      address: this.address,
      clientId: client.id,
      createdBy: 0,
      bookmarks,
    };

    this.setsService.addSet(newSet).subscribe({
      next: (response) => {
        this.notificationService.showNotification(
          'success',
          'Nowe zestawienie zostało dodane',
        );
        this.router.navigate([`/sets/${response.id}`]);
      },
      error: (error) => {
        this.notificationService.showNotification('error', error.message);
      },
    });
  }
}
