import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationModalService } from '../../services/confirmation.service';
import { NotificationService } from '../../services/notification.service';
import { IConfirmationMessage } from '../../services/types/IConfirmationMessage';
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
    ToolbarModule,
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
})
export class ClientsComponent implements OnInit {
  isLoading = true;
  clientDialog: boolean = false;
  clientDialogHeader: string = '';
  clients!: IClient[];
  client!: IClient;
  selectedClient!: IClient[] | null;
  @ViewChild('dt') dt!: Table;
  cols!: IColumn[];
  exportColumns!: IExportColumn[];

  constructor(
    private clientsService: ClientsService,
    private notificationService: NotificationService,
    private confirmationModalService: ConfirmationModalService,
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

    this.clientDialog = true;
    this.clientDialogHeader = 'Nowy klient';
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
    this.clientDialogHeader = 'Edytuj klienta';
  }

  deleteSelectedClient() {
    const accept = () => {
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
    };

    const confirmMessage: IConfirmationMessage = {
      message: 'Czy na pewno usunąć zaznaczonych klientów?',
      header: 'Potwierdź usunięcie klientów',
      accept,
    };

    this.confirmationModalService.showConfirmation(confirmMessage);
  }
  hideDialog() {
    this.clientDialog = false;
    this.form.reset();
  }

  deleteClient(client: IClient) {
    const accept = () => {
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
    };

    const confirmMessage: IConfirmationMessage = {
      message: 'Czy na pewno usunąć klienta ' + client.firma + '?',
      header: 'Potwierdź usunięcie klienta',
      accept,
    };

    this.confirmationModalService.showConfirmation(confirmMessage);
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
    if (!this.form.valid) {
      (
        Object.keys(this.form.controls) as (keyof typeof this.form.controls)[]
      ).forEach((control) => {
        this.form.controls[control].markAsTouched();
      });
      return;
    } else {
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
            this.clients.unshift(newClient as IClient);
            this.cd.markForCheck();
          },
          error: (error) => {
            this.notificationService.showNotification('error', error.message);
          },
        });
      }

      this.clients = [...this.clients];
      this.clientDialog = false;
      this.form.reset();
    }
  }
  onGlobalFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (this.dt) {
      this.dt.filterGlobal(inputElement.value, 'contains');
    }
  }

  getClientSetCount(clientId: number) {
    const count = this.clients.filter((item) => item.id === clientId)[0]
      ?.setCount;
    return count || 0;
  }
}
