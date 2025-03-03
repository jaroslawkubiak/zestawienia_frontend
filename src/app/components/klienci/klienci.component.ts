import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../login/auth.service';
import { ApiService } from '../../services/api.service';
import { IKlient } from './IKlient';

import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
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
    RadioButton,
    InputTextModule,
    FormsModule,
    InputNumber,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
  ],
  providers: [MessageService, ConfirmationService, ApiService],
  styleUrl: './klienci.component.css',
})
export class KlienciComponent implements OnInit {
  productDialog: boolean = false;
  klienci!: IKlient[];
  klient!: IKlient;
  selectedClient!: IKlient[] | null;
  submitted: boolean = false;
  @ViewChild('dt') dt!: Table;
  cols!: Column[];
  exportColumns!: ExportColumn[];
  public authorizationToken: string | null;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,

    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef
  ) {
    this.authorizationToken = this.authService.authorizationToken;
  }

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
    this.klient = {} as IKlient;
    this.submitted = false;
    this.productDialog = true;
  }

  editProduct(product: IKlient) {
    this.klient = { ...product };
    this.productDialog = true;
  }

  deleteSelectedClient() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.klienci = this.klienci.filter(
          (val) => !this.selectedClient?.includes(val)
        );
        this.selectedClient = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Products Deleted',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  deleteClient(klient: IKlient) {
    this.confirmationService.confirm({
      message: 'Na pewno usunąć klienta ' + klient.firma + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.klienci = this.klienci.filter((val) => val.id !== klient.id);
        // this.klient = {};
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Klient usunięty',
          life: 3000,
        });
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

    if (this.klient.firma?.trim()) {
      if (this.klient.id) {
        this.klienci[this.findIndexById(this.klient.id)] = this.klient;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Updated',
          life: 3000,
        });
      } else {
        this.klient.image = 'product-placeholder.svg';
        this.klienci.push(this.klient);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Created',
          life: 3000,
        });
      }

      this.klienci = [...this.klienci];
      this.productDialog = false;
      // this.klient = {};
    }
  }
}
