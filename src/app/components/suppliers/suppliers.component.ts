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
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { IColumn, IExportColumn } from '../../shared/types/ITable';
import { SuppliersService } from './suppliers.service';
import { ISupplier } from './types/ISupplier';
import { IConfirmationMessage } from '../../services/types/IConfirmationMessage';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css',
  standalone: true,
  imports: [
    TableModule,
    Dialog,
    SelectModule,
    ToolbarModule,
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
})
export class SuppliersComponent implements OnInit {
  isLoading = true;
  supplierDialog: boolean = false;
  supplierDialogHeader: string = '';
  suppliers!: ISupplier[];
  supplier!: ISupplier;
  selected!: ISupplier[] | null;
  @ViewChild('dt') dt!: Table;
  cols!: IColumn[];
  exportColumns!: IExportColumn[];

  constructor(
    private suppliersService: SuppliersService,
    private notificationService: NotificationService,
    private confirmationModalService: ConfirmationModalService,
    private cd: ChangeDetectorRef
  ) {}

  form = new FormGroup({
    company: new FormControl('', {
      validators: [Validators.required],
    }),
    address: new FormControl(''),
    firstName: new FormControl('', {
      validators: [Validators.required],
    }),
    lastName: new FormControl('', {
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    telephone: new FormControl(''),
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
      { field: 'company', header: 'company' },
      { field: 'address', header: 'Adres' },
      { field: 'firstName', header: 'Imię' },
      { field: 'lastName', header: 'lastName' },
      { field: 'email', header: 'E-mail' },
      { field: 'telephone', header: 'telephone' },
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));
  }

  openNew() {
    this.supplier = {} as ISupplier;
    this.form.setValue({
      company: null,
      address: null,
      firstName: null,
      lastName: null,
      email: null,
      telephone: null,
    });

    this.supplierDialog = true;
    this.supplierDialogHeader = 'Nowy dostawca';
  }

  editSupplier(supplier: ISupplier) {
    this.supplier = { ...supplier };
    this.form.setValue({
      company: this.supplier.company ?? null,
      address: this.supplier.address ?? null,
      firstName: this.supplier.firstName ?? null,
      lastName: this.supplier.lastName ?? null,
      email: this.supplier.email ?? null,
      telephone: this.supplier.telephone ?? null,
    });

    this.supplierDialog = true;
    this.supplierDialogHeader = 'Edytuj dostawcę';
  }

  deleteSelectedSupplier() {
    const accept = () => {
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
    };

    const confirmMessage: IConfirmationMessage = {
      message: 'Czy na pewno usunąć zaznaczonych dostawców?',
      header: 'Potwierdź usunięcie dostawców',
      accept,
    };

    this.confirmationModalService.showConfirmation(confirmMessage);
  }

  hideDialog() {
    this.supplierDialog = false;
    this.form.reset();
  }

  deleteSupplier(supplier: ISupplier) {
    const accept = () => {
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
    };

    const confirmMessage: IConfirmationMessage = {
      message: 'Czy na pewno usunąć dostawcę ' + supplier.company + '?',
      header: 'Potwierdź usunięcie dostawcy',
      accept,
    };

    this.confirmationModalService.showConfirmation(confirmMessage);
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
    if (!this.form.valid) {
      (
        Object.keys(this.form.controls) as (keyof typeof this.form.controls)[]
      ).forEach((control) => {
        this.form.controls[control].markAsTouched();
      });
      return;
    } else {
      // save supplier
      if (this.supplier.id) {
        const editedSupplier: ISupplier = {
          id: this.supplier.id,
          email: this.form.value.email || '',
          firstName: this.form.value.firstName!,
          lastName: this.form.value.lastName!,
          company: this.form.value.company!,
          telephone: this.form.value.telephone || '',
          address: this.form.value.address || '',
          positionCount: this.supplier.positionCount,
        };

        this.suppliersService.saveSupplier(editedSupplier).subscribe({
          next: (response) => {
            this.suppliers[this.findIndexById(this.supplier.id)] =
              editedSupplier;
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
          firstName: this.form.value.firstName!,
          lastName: this.form.value.lastName!,
          email: this.form.value.email!,
          company: this.form.value.company!,
          telephone: this.form.value.telephone || undefined,
          address: this.form.value.address || undefined,
        };

        this.suppliersService.addSupplier(newSupplier).subscribe({
          next: (response) => {
            this.notificationService.showNotification(
              'success',
              'Dostawca został dodany'
            );
            this.suppliers.unshift(response);
            this.cd.markForCheck();
          },
          error: (error) => {
            this.notificationService.showNotification('error', error.message);
          },
        });
      }

      this.suppliers = [...this.suppliers];
      this.supplierDialog = false;
      this.form.reset();
    }
  }

  onGlobalFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (this.dt) {
      this.dt.filterGlobal(inputElement.value, 'contains');
    }
  }

  getSupplierPositionCount(supplierId: number) {
    const count = this.suppliers.filter((item) => item.id === supplierId)[0]
      ?.positionCount;
    return count || 0;
  }
}
