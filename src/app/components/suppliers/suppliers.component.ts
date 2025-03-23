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
    LoadingSpinnerComponent,
    TooltipModule,
  ],
  providers: [
    NotificationService,
    MessageService,
    ConfirmationService,
    SuppliersService,
  ],
})
export class SuppliersComponent implements OnInit {
  isLoading = true;
  supplierDialog: boolean = false;
  suppliers!: ISupplier[];
  supplier!: ISupplier;
  selected!: ISupplier[] | null;
  submitted: boolean = false;
  @ViewChild('dt') dt!: Table;
  cols!: IColumn[];
  exportColumns!: IExportColumn[];

  constructor(
    private suppliersService: SuppliersService,
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
    this.getSuppliers();
  }

  getSuppliers() {
    this.suppliersService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.isLoading = false;
        this.cd.markForCheck();
      },
      error: (err) => console.error('Error getting suppliers ', err),
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
      header: 'Potwierdź usunięcie dostawców',
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

        this.suppliersService.removeSuppliers(idList).subscribe({
          next: (response) => {
            this.notificationService.showNotification(
              'success',
              'Dostawcy zostali usunięci'
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
        this.suppliersService.removeSuppliers([supplier.id]).subscribe({
          next: (response) => {
            this.notificationService.showNotification(
              'success',
              'Dostawca został usunięty'
            );
          },
          error: (error) => {
            this.notificationService.showNotification('error', error.message);
          },
        });

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

        this.suppliersService.saveSupplier(editedSupplier).subscribe({
          next: (response) => {
            this.notificationService.showNotification(
              'success',
              'Dane dostawcy zaktualizowane'
            );
          },
          error: (error) => {
            this.notificationService.showNotification('error', error.message);
          },
        });
      } else {
        // add supplier
        const newSupplier: Partial<ISupplier> = {
          imie: this.form.value.imie!,
          nazwisko: this.form.value.nazwisko!,
          firma: this.form.value.firma!,
          telefon: this.form.value.telefon || undefined,
          email: this.form.value.email || undefined,
        };

        this.suppliersService.addSupplier(newSupplier).subscribe({
          next: (response) => {
            this.notificationService.showNotification(
              'success',
              'Dostawca został dodany'
            );
            this.suppliers.push(newSupplier as ISupplier);
            this.cd.markForCheck();
          },
          error: (error) => {
            this.notificationService.showNotification('error', error.message);
          },
        });
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
