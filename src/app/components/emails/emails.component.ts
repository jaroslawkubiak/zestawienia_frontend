import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
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
    Dialog,
  ],
  templateUrl: './emails.component.html',
  styleUrl: './emails.component.css',
})
export class EmailsComponent implements OnInit {
  isLoading = true;
  emails!: ISendedEmailsFromDB[];
  @ViewChild('dt') dt!: Table;
  cols!: IColumn[];
  previewDialogHeader = '';
  htmlContent!: SafeHtml;
  previewDialog = false;

  constructor(
    private emailsService: EmailsService,
    private router: Router,
    private sanitizer: DomSanitizer,

    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
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

  openEmailPreview(id: number) {
    const email = this.emails.find((email) => email.id === id);
    if (!email) {
      return;
    }

    this.previewDialogHeader = email.subject;

    this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(
      email.content.replace(
        /<body.*?>|<\/body>|<html.*?>|<\/html>|<head.*?>.*?<\/head>/g,
        '',
      ),
    );

    this.previewDialog = true;
  }

  onDialogClosed() {
    this.htmlContent = '';
    this.previewDialogHeader = '';
    this.previewDialog = false;
  }

  onGlobalFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (this.dt) {
      this.dt.filterGlobal(inputElement.value, 'contains');
    }
  }
}
