import { Component, OnInit, viewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
} from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { AuthService } from '../../../login/auth.service';
import { ClientsService } from '../../clients/clients.service';
import { IClient } from '../../clients/IClient';
import { SettingsService } from '../../settings/settings.service';
import { CommonModule } from '@angular/common';
import { BookmarksService } from '../../bookmarks/bookmarks.service';
import { IBookmark } from '../../bookmarks/IBookmark';
import { ButtonModule } from 'primeng/button';
import { INewSet } from './INewSet';
import { SetsService } from '../sets.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-new-set',
  templateUrl: './new-set.component.html',
  standalone: true,
  imports: [
    ToastModule,
    FormsModule,
    SelectModule,
    CheckboxModule,
    CommonModule,
    ButtonModule,
  ],
  providers: [MessageService],
  styleUrls: ['./new-set.component.css', '../../../shared/css/basic.css'],
})
export class NewSetComponent implements OnInit {
  setNumber: string = '';
  userId = Number(localStorage.getItem('user_id'));

  allClients: IClient[] | undefined;
  selectedClient = '';
  allBookmarks: IBookmark[] = [];
  selectedBookmarks: IBookmark[] = [];

  public authorizationToken: string | null;
  // private formularz = viewChild.required<NgForm>('form');

  constructor(
    private authService: AuthService,
    private settingsService: SettingsService,
    private bookmarksService: BookmarksService,
    private setsService: SetsService,
    private clientsService: ClientsService,
    private messageService: MessageService
  ) {
    this.authorizationToken = this.authService.authorizationToken;
  }

  ngOnInit() {
    this.getSetNumber();
    this.getClients();
    this.getBookmarks();
  }

  getSetNumber() {
    this.settingsService.getSetNumber().subscribe({
      next: (data) => {
        const currentYear = new Date().getFullYear();
        this.setNumber = `${data[0].value}/${currentYear}`;
      },
      error: (err) => console.error('Error getting set number ', err),
    });
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
    bookmarks.map((item: IBookmark) => delete item.default);
    //TODO remove this later when turn on auth
    if (this.userId === 0) {
      this.userId = 2;
    }

    const newSet: INewSet = {
      numer: this.setNumber,
      clientId: client.id,
      createdBy: this.userId,
      bookmarks,
    };

    if (this.authorizationToken) {
      this.setsService.addSet(this.authorizationToken, newSet).subscribe({
        next: (response) => {
          console.log(`##### sukces #####`);
          //TODO nie działa notyfikacja
          this.messageService.add({
            severity: 'success',
            summary: 'Sukces',
            detail: 'Nowe zestawienie zostało dodane',
            life: 3000,
          });
        },
        error: (error) => {
          console.log(`##### error #####`);
          this.messageService.add({
            severity: 'error',
            summary: 'Błąd',
            detail: error.message,
            life: 3000,
          });
        },
      });
    }
  }
}
