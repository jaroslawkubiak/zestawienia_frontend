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
import { notificationLifeTime } from '../../shared/constans';
import { IColumn, IExportColumn } from '../../shared/types/ITable';
import { ISupplier } from './ISupplier';
import { SuppliersService } from './suppliers.service';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css',
  standalone: true,
  imports: [
    TableModule,
    Dialog,
    SelectModule,
    ToastModule,
    ToolbarModule,
    ConfirmDialog,
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
  providers: [MessageService, ConfirmationService, SuppliersService],
})
export class SuppliersComponent implements OnInit {
  supplierDialog: boolean = false;
  suppliers!: ISupplier[];
  supplier!: ISupplier;
  selected!: ISupplier[] | null;
  submitted: boolean = false;
  @ViewChild('dt') dt!: Table;
  cols!: IColumn[];
  exportColumns!: IExportColumn[];
  private authorizationToken: string | null;

  constructor(
    private authService: AuthService,
    private suppliersService: SuppliersService,

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
    this.getSuppliers();
  }

  getSuppliers() {
    if (this.authorizationToken) {
      this.suppliersService.getSuppliers(this.authorizationToken).subscribe({
        next: (data) => {
          this.suppliers = data;
          this.cd.markForCheck();
        },
        error: (err) => console.error('Error getting suppliers ', err),
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
    this.supplier = {} as ISupplier;
    this.form.setValue({
      firma: null,
      imie: null,
      nazwisko: null,
      email: null,
      telefon: null,
    });
    this.submitted = false;
    this.supplierDialog = true;
  }

  editSupplier(supplier: ISupplier) {
    this.supplier = { ...supplier };
    this.form.setValue({
      firma: this.supplier.firma ?? null,
      imie: this.supplier.imie ?? null,
      nazwisko: this.supplier.nazwisko ?? null,
      email: this.supplier.email ?? null,
      telefon: this.supplier.telefon ?? null,
    });

    this.supplierDialog = true;
  }

  deleteSelectedSupplier() {
    this.confirmationService.confirm({
      message: 'Czy na pewno usunąć zaznaczonych dostawców?',
      header: 'Potwierdź usunięcie dostawcy',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Tak',
      acceptIcon: 'pi pi-trash',
      rejectLabel: 'Nie',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.suppliers = this.suppliers.filter(
          (val) => !this.selected?.includes(val)
        );
        const idList = this.selected?.map((val) => val.id) ?? [];
        this.selected = null;

        if (this.authorizationToken) {
          this.suppliersService
            .removeSuppliers(this.authorizationToken, idList)
            .subscribe({
              next: (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Sukces',
                  detail: 'Dostawcy zostali usunięci',
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
      },
    });
  }

  hideDialog() {
    this.supplierDialog = false;
    this.submitted = false;
  }

  deleteSupplier(supplier: ISupplier) {
    this.confirmationService.confirm({
      message: 'Czy na pewno usunąć dostawcę ' + supplier.firma + ' ?',
      header: 'Potwierdź usunięcie dostawcy',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Tak',
      acceptIcon: 'pi pi-trash',
      rejectLabel: 'Nie',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        if (this.authorizationToken) {
          this.suppliersService
            .removeSuppliers(this.authorizationToken, [supplier.id])
            .subscribe({
              next: (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Sukces',
                  detail: 'Dostawca został usunięty',
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
        this.suppliers = this.suppliers.filter((val) => val.id !== supplier.id);
      },
    });
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.suppliers.length; i++) {
      if (this.suppliers[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  saveSupplier() {
    this.submitted = true;
    if (this.form.valid) {
      // save supplier
      if (this.supplier.id) {
        const editedSupplier: ISupplier = {
          id: this.supplier.id,
          email: this.form.value.email || '',
          imie: this.form.value.imie!,
          nazwisko: this.form.value.nazwisko!,
          firma: this.form.value.firma!,
          telefon: this.form.value.telefon || '',
        };
        this.suppliers[this.findIndexById(this.supplier.id)] = editedSupplier;

        if (this.authorizationToken) {
          this.suppliersService
            .saveSupplier(this.authorizationToken, editedSupplier)
            .subscribe({
              next: (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Sukces',
                  detail: 'Dane dostawcy zaktualizowane',
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
      } else {
        // add supplier
        const newSupplier: Partial<ISupplier> = {
          imie: this.form.value.imie!,
          nazwisko: this.form.value.nazwisko!,
          firma: this.form.value.firma!,
          telefon: this.form.value.telefon || undefined,
          email: this.form.value.email || undefined,
        };

        if (this.authorizationToken) {
          this.suppliersService
            .addSupplier(this.authorizationToken, newSupplier)
            .subscribe({
              next: (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Sukces',
                  detail: 'Dostawca został dodany',
                  life: notificationLifeTime,
                });
                this.suppliers.push(newSupplier as ISupplier);
                this.cd.markForCheck();
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

      this.suppliers = [...this.suppliers];
      this.supplierDialog = false;
    }
  }

  onGlobalFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (this.dt) {
      this.dt.filterGlobal(inputElement.value, 'contains');
    }
  }
}
