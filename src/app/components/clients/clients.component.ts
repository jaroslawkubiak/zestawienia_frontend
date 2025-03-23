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
import { TooltipModule } from 'primeng/tooltip';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { IColumn, IExportColumn } from '../../shared/types/ITable';
import { ClientsService } from './clients.service';
import { IClient } from './types/IClient';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css',
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
    LoadingSpinnerComponent,
    TooltipModule,
  ],
  providers: [
    NotificationService,
    MessageService,
    ConfirmationService,
    ClientsService,
  ],
})
export class ClientsComponent implements OnInit {
  isLoading = true;
  clientDialog: boolean = false;
  clients!: IClient[];
  client!: IClient;
  selectedClient!: IClient[] | null;
  submitted: boolean = false;
  @ViewChild('dt') dt!: Table;
  cols!: IColumn[];
  exportColumns!: IExportColumn[];

  constructor(
    private clientsService: ClientsService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef
  ) {}

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
    this.clientsService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.isLoading = false;
        this.cd.markForCheck();
      },
      error: (err) => console.error('Error getting clients ', err),
    });

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
      header: 'Potwierdź usunięcie klientów',
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

        this.clientsService.removeClients(idList).subscribe({
          next: (response) => {
            this.notificationService.showNotification(
              'success',
              'Klienci zostali usunięci'
            );
          },
          error: (error) => {
            this.notificationService.showNotification('error', error.message);
          },
        });
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
        this.clientsService.removeClients([client.id]).subscribe({
          next: (response) => {
            this.notificationService.showNotification(
              'success',
              'Klient został usunięty'
            );
          },
          error: (error) => {
            this.notificationService.showNotification('error', error.message);
          },
        });

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

        this.clientsService.saveClient(editedClient).subscribe({
          next: (response) => {
            this.notificationService.showNotification(
              'success',
              'Dane klienta zaktualizowane'
            );
          },
          error: (error) => {
            this.notificationService.showNotification('error', error.message);
          },
        });
      } else {
        // add client
        const newClient: Partial<IClient> = {
          email: this.form.value.email!,
          imie: this.form.value.imie!,
          nazwisko: this.form.value.nazwisko!,
          firma: this.form.value.firma!,
          telefon: this.form.value.telefon || undefined,
        };

        this.clientsService.addClient(newClient).subscribe({
          next: (response) => {
            this.notificationService.showNotification(
              'success',
              'Klient został dodany'
            );
            this.clients.push(newClient as IClient);
            this.cd.markForCheck();
          },
          error: (error) => {
            this.notificationService.showNotification('error', error.message);
          },
        });
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
