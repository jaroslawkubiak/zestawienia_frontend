import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
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
import { AuthService } from '../../login/auth.service';
import { ClientsService } from './clients.service';
import { IClient } from './IClient';

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
  selector: 'app-clients',
  templateUrl: './clients.component.html',
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
    FormsModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    ReactiveFormsModule,
  ],
  providers: [MessageService, ConfirmationService, ClientsService],
  styleUrls: ['./clients.component.css', '../../shared/css/basic.css'],
})
export class ClientsComponent implements OnInit {
  clientDialog: boolean = false;
  clients!: IClient[];
  client!: IClient;
  selectedClient!: IClient[] | null;
  submitted: boolean = false;
  @ViewChild('dt') dt!: Table;
  cols!: Column[];
  exportColumns!: ExportColumn[];
  public authorizationToken: string | null;

  constructor(
    private authService: AuthService,
    private clientsService: ClientsService,

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
    this.getClients();
  }

  getClients() {
    if (this.authorizationToken) {
      this.clientsService.getClients(this.authorizationToken).subscribe({
        next: (data) => {
          this.clients = data;
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
    this.client = {} as IClient;
    this.form.setValue({
      firma: null,
      imie: null,
      nazwisko: null,
      email: null,
      telefon: null,
    });
    this.submitted = false;
    this.clientDialog = true;
  }

  editClient(client: IClient) {
    this.client = { ...client };
    this.form.setValue({
      firma: this.client.firma ?? null,
      imie: this.client.imie ?? null,
      nazwisko: this.client.nazwisko ?? null,
      email: this.client.email ?? null,
      telefon: this.client.telefon ?? null,
    });

    this.clientDialog = true;
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
        this.clients = this.clients.filter(
          (val) => !this.selectedClient?.includes(val)
        );

        const idList = this.selectedClient?.map((client) => client.id) ?? [];
        this.selectedClient = null;

        if (this.authorizationToken) {
          this.clientsService
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
    this.clientDialog = false;
    this.submitted = false;
  }

  deleteClient(client: IClient) {
    this.confirmationService.confirm({
      message: 'Czy na pewno usunąć klienta ' + client.firma + ' ?',
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
          this.clientsService
            .removeClients(this.authorizationToken, [client.id])
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

        this.clients = this.clients.filter((val) => val.id !== client.id);
      },
    });
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.clients.length; i++) {
      if (this.clients[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  saveClient() {
    this.submitted = true;
    if (this.form.valid) {
      // save client
      if (this.client.id) {
        const editedClient: IClient = {
          id: this.client.id,
          email: this.form.value.email!,
          imie: this.form.value.imie!,
          nazwisko: this.form.value.nazwisko!,
          firma: this.form.value.firma!,
          telefon: this.form.value.telefon || '',
        };
        this.clients[this.findIndexById(this.client.id)] = editedClient;

        if (this.authorizationToken) {
          this.clientsService
            .saveClient(this.authorizationToken, editedClient)
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
        const newClient: Partial<IClient> = {
          email: this.form.value.email!,
          imie: this.form.value.imie!,
          nazwisko: this.form.value.nazwisko!,
          firma: this.form.value.firma!,
          telefon: this.form.value.telefon || undefined,
        };

        if (this.authorizationToken) {
          this.clientsService
            .addClient(this.authorizationToken, newClient)
            .subscribe({
              next: (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Sukces',
                  detail: 'Klient został dodany',
                  life: 3000,
                });
                this.clients.push(newClient as IClient);
                this.cd.markForCheck();
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

      this.clients = [...this.clients];
      this.clientDialog = false;
    }
  }

  onGlobalFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (this.dt) {
      this.dt.filterGlobal(inputElement.value, 'contains');
    }
  }
}
