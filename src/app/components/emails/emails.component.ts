import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { IColumn } from '../../shared/types/ITable';
import { EmailsService } from './email.service';
import { ISendedEmailsFromDB } from './types/ISendedEmailsFromDB';

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
  emails!: ISendedEmailsFromDB[];
  @ViewChild('dt') dt!: Table;
  cols!: IColumn[];
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
        this.emails = data.map((email) => {
          const isSupplier = email.supplier?.company ? true : false;

          const icon = isSupplier
            ? 'pi pi-truck i-supplier'
            : 'pi pi-user i-client';

          const company = isSupplier
            ? email.supplier?.company
            : email.client?.company;

          const emailTo = isSupplier
            ? email.supplier?.email
            : email.client?.email;

          const fullName = isSupplier
            ? `${email.supplier?.firstName}  ${email.supplier?.lastName}`
            : `${email.client?.firstName}  ${email.client?.lastName}`;

          return { ...email, company, icon, fullName, emailTo };
        });

        this.isLoading = false;
        this.cd.markForCheck();
      },
      error: (err) => console.error('Error getting emails ', err),
    });
  }

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
