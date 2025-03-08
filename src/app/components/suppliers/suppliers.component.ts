import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../login/auth.service';
import { ISupplier } from './ISupplier';
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
import { SuppliersService } from './suppliers.service';

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
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
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
  providers: [MessageService, ConfirmationService, SuppliersService],
  styleUrls: ['./suppliers.component.css', '../../shared/css/basic.css'],
})
export class SuppliersComponent implements OnInit {
  supplierDialog: boolean = false;
  suppliers!: ISupplier[];
  supplier!: ISupplier;
  selected!: ISupplier[] | null;
  submitted: boolean = false;
  @ViewChild('dt') dt!: Table;
  cols!: Column[];
  exportColumns!: ExportColumn[];
  public authorizationToken: string | null;

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
      validators: [Validators.email],
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
      firma: 'testt',
      imie: 'testt',
      nazwisko: 'testt',
      email: null,
      telefon: null,
    });
    // this.form.setValue({
    //   firma: null,
    //   imie: null,
    //   nazwisko: null,
    //   email: null,
    //   telefon: null,
    // });
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
    console.log(this.form.valid);
    console.log(this.form);
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
        // add supplier
        console.log(`##### nowy dostawca #####`);
        this.suppliers.push(this.supplier);

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

      this.suppliers = [...this.suppliers];
      this.supplierDialog = false;
    }
  }
}
