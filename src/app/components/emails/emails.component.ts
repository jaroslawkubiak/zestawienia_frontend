import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { IColumn, IExportColumn } from '../../shared/types/ITable';
import { EmailsService } from './email.service';
import { IEmailsList } from './types/IEmailsList';
import { Router } from '@angular/router';

@Component({
  selector: 'app-emails',
  imports: [
    TableModule,
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
  templateUrl: './emails.component.html',
  styleUrl: './emails.component.css',
})
export class EmailsComponent {
  isLoading = true;
  emailDialog: boolean = false;
  emailDialogHeader: string = '';
  emails!: IEmailsList[];
  email!: IEmailsList;
  @ViewChild('dt') dt!: Table;
  cols!: IColumn[];
  exportColumns!: IExportColumn[];

  constructor(
    private emailsService: EmailsService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getEmails();
  }

  getEmails() {
    this.emailsService.getEmails().subscribe({
      next: (data) => {
        this.emails = data.map((item) => {
          const firma = item.clientId?.firma
            ? item.clientId?.firma
            : item.supplierId?.firma;
          const type = item.clientId?.firma
            ? 'pi pi-user i-client'
            : 'pi pi-truck i-supplier';

          return { ...item, firma, type };
        });

        this.isLoading = false;
        this.cd.markForCheck();
      },
      error: (err) => console.error('Error getting emails ', err),
    });

    this.cols = [
      { field: 'firma', header: 'Firma' },
      { field: 'to', header: 'Email' },
      { field: 'setId.name', header: 'Nazwa zestawienia' },
      { field: 'sendAt', header: 'Wysłany' },
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));
  }

  // hideDialog() {
  //   this.emailDialog = false;
  // }

  openSet(setId: number) {
    this.router.navigate([`/sets/${setId}`]);
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.emails.length; i++) {
      if (this.emails[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  onGlobalFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (this.dt) {
      this.dt.filterGlobal(inputElement.value, 'contains');
    }
  }
}
