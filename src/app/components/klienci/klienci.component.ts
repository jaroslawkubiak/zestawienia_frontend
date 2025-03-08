import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../login/auth.service';
import { ApiService } from '../../services/api.service';
import { IClient } from './IKlient';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-klienci',
  templateUrl: './klienci.component.html',
  standalone: true,
  imports: [
    TableModule,
    Dialog,
    SelectModule,
    ToastModule,
    ToolbarModule,
    ConfirmDialog,
    InputTextModule,
    TextareaModule,
    CommonModule,
    DropdownModule,
    InputTextModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    ReactiveFormsModule,
  ],
  providers: [MessageService, ConfirmationService, ApiService],
  styleUrls: ['./klienci.component.css', '../../shared/css/basic.css'],
})
export class KlienciComponent implements OnInit {
  klientDialog: boolean = false;
  klienci!: IClient[];
  klient!: IClient;
  selectedClient!: IClient[] | null;
  submitted: boolean = false;
  @ViewChild('dt') dt!: Table;
  cols!: Column[];
  exportColumns!: ExportColumn[];
  public authorizationToken: string | null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,

    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef
  ) {
    this.authorizationToken = this.authService.authorizationToken;
  }

  form = new FormGroup({
    firma: new FormControl('', {
      validators: [Validators.required],
    }),
    imie: new FormControl('', {
      validators: [Validators.required],
    }),
    nazwisko: new FormControl('', {
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    telefon: new FormControl(''),
  });

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients() {
    if (this.authorizationToken) {
      this.apiService.getClients(this.authorizationToken).subscribe({
        next: (data) => {
          this.klienci = data;
          this.cd.markForCheck();
        },
        error: (err) => console.error('Error getting clients ', err),
      });
    } else {
      console.error('Authorization token is missing');
    }

    this.cols = [
      { field: 'firma', header: 'Firma' },
      { field: 'imie', header: 'Imię' },
      { field: 'nazwisko', header: 'Nazwisko' },
      { field: 'email', header: 'E-mail' },
      { field: 'telefon', header: 'Telefon' },
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));
  }

  openNew() {
    this.klient = {} as IClient;
    this.form.setValue({
      firma: null,
      imie: null,
      nazwisko: null,
      email: null,
      telefon: null,
    });
    this.submitted = false;
    this.klientDialog = true;
  }

  editKlient(klient: IClient) {
    this.klient = { ...klient };
    this.form.setValue({
      firma: this.klient.firma ?? null,
      imie: this.klient.imie ?? null,
      nazwisko: this.klient.nazwisko ?? null,
      email: this.klient.email ?? null,
      telefon: this.klient.telefon ?? null,
    });

    this.klientDialog = true;
  }

  deleteSelectedClient() {
    this.confirmationService.confirm({
      message: 'Czy na pewno usunąć zaznaczonych klientów?',
      header: 'Potwierdź usunięcie klienta',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Tak',
      acceptIcon: 'pi pi-trash',
      rejectLabel: 'Nie',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.klienci = this.klienci.filter(
          (val) => !this.selectedClient?.includes(val)
        );
        const idList = this.selectedClient?.map((client) => client.id) ?? [];
        this.selectedClient = null;

        if (this.authorizationToken) {
          this.apiService
            .removeClients(this.authorizationToken, idList)
            .subscribe({
              next: (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Sukces',
                  detail: 'Klienci zostali usunięci',
                  life: 3000,
                });
              },
              error: (error) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Błąd',
                  detail: error.message,
                  life: 3000,
                });
              },
            });
        }
      },
    });
  }

  hideDialog() {
    this.klientDialog = false;
    this.submitted = false;
  }

  deleteClient(klient: IClient) {
    this.confirmationService.confirm({
      message: 'Czy na pewno usunąć klienta ' + klient.firma + ' ?',
      header: 'Potwierdź usunięcie klienta',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Tak',
      acceptIcon: 'pi pi-trash',
      rejectLabel: 'Nie',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        if (this.authorizationToken) {
          this.apiService
            .removeClients(this.authorizationToken, [klient.id])
            .subscribe({
              next: (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Sukces',
                  detail: 'Klient został usunięty',
                  life: 3000,
                });
              },
              error: (error) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Błąd',
                  detail: error.message,
                  life: 3000,
                });
              },
            });
        }
        this.klienci = this.klienci.filter((val) => val.id !== klient.id);
      },
    });
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.klienci.length; i++) {
      if (this.klienci[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  saveClient() {
    this.submitted = true;
    if (
      this.form.value.firma?.trim() &&
      this.form.value.nazwisko &&
      this.form.value.imie &&
      this.form.value.email
    ) {
      // save client
      if (this.klient.id) {
        const editedKlient: IClient = {
          id: this.klient.id,
          email: this.form.value.email,
          imie: this.form.value.imie,
          nazwisko: this.form.value.nazwisko,
          firma: this.form.value.firma,
          telefon: this.form.value.telefon || '',
        };
        this.klienci[this.findIndexById(this.klient.id)] = editedKlient;

        if (this.authorizationToken) {
          this.apiService
            .saveClient(this.authorizationToken, editedKlient)
            .subscribe({
              next: (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Sukces',
                  detail: 'Dane klienta zaktualizowane',
                  life: 3000,
                });
              },
              error: (error) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Błąd',
                  detail: error.message,
                  life: 3000,
                });
              },
            });
        }
      } else {
        // add client
        this.klienci.push(this.klient);
        const newClient: Partial<IClient> = {
          email: this.form.value.email,
          imie: this.form.value.imie,
          nazwisko: this.form.value.nazwisko,
          firma: this.form.value.firma,
          telefon: this.form.value.telefon || undefined,
        };

        if (this.authorizationToken) {
          this.apiService
            .addClient(this.authorizationToken, newClient)
            .subscribe({
              next: (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Sukces',
                  detail: 'Klient został dodany',
                  life: 3000,
                });
              },
              error: (error) => {
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

      this.klienci = [...this.klienci];
      this.klientDialog = false;
    }
  }
}
