import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../login/auth.service';
import { notificationLifeTime } from '../../../shared/constans';
import { BookmarksService } from '../../bookmarks/bookmarks.service';
import { IBookmark } from '../../bookmarks/IBookmark';
import { ClientsService } from '../../clients/clients.service';
import { IClient } from '../../clients/IClient';
import { SetsService } from '../sets.service';
import { INewSet } from '../types/INewSet';
import { bookarksDefaultWidth } from '../../bookmarks/bookmarks-width';

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
  providers: [MessageService],
})
export class NewSetComponent implements OnInit {
  name: string = '';
  userId: number | null;
  allClients: IClient[] | undefined;
  selectedClient = '';
  allBookmarks: IBookmark[] = [];
  selectedBookmarks: IBookmark[] = [];
  private authorizationToken: string | null;

  constructor(
    private authService: AuthService,
    private bookmarksService: BookmarksService,
    private setsService: SetsService,
    private clientsService: ClientsService,
    private messageService: MessageService
  ) {
    this.authorizationToken = this.authService.authorizationToken;
    this.userId = this.authService.userId();
  }

  ngOnInit() {
    this.getClients();
    this.getBookmarks();
  }

  getClients() {
    this.clientsService.getClients(this.authorizationToken).subscribe({
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

    if (this.authorizationToken && this.userId) {
      const newSet: INewSet = {
        name: this.name,
        clientId: client.id,
        createdBy: this.userId,
        bookmarks,
      };

      this.setsService.addSet(this.authorizationToken, newSet).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sukces',
            detail: 'Nowe zestawienie zostało dodane',
            life: notificationLifeTime,
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Błąd',
            detail: error.message,
            life: notificationLifeTime,
          });
        },
      });
    }
  }
}
