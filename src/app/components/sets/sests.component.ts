import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
// import { ConfirmDialog } from 'primeng/confirmdialog';
// import { Dialog } from 'primeng/dialog';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { AuthService } from '../../login/auth.service';
import { ISet } from './ISet';
import { SetsService } from './sets.service';
import { IColumn, IExportColumn } from '../../shared/types/ITable';
// import { notificationLifeTime } from '../../shared/constans';

@Component({
  selector: 'app-sests',
  templateUrl: './sests.component.html',
  styleUrl: './sests.component.css',
  standalone: true,
  imports: [
    ToolbarModule,
    TableModule,
    ToastModule,
    InputTextModule,
    TextareaModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    IconFieldModule,
    ButtonModule,
    ReactiveFormsModule,
    TagModule,
    InputIconModule,
    MultiSelectModule,
    SelectModule,
  ],
  providers: [SetsService, MessageService, ConfirmationService],
})
export class SetsComponent implements OnInit {
  private authorizationToken: string | null;
  sets: ISet[] = [];
  @ViewChild('dt') dt!: Table;
  cols!: IColumn[];
  exportColumns!: IExportColumn[];

  constructor(
    private router: Router,
    private setsService: SetsService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.authorizationToken = this.authService.authorizationToken;
  }

  ngOnInit() {
    this.getSets();
  }

  getSets() {
    this.setsService.getSets(this.authorizationToken).subscribe({
      next: (data) => {
        this.sets = data;
        this.cd.markForCheck();
      },
      error: (err) => console.error('Error getting sets ', err),
    });

    this.cols = [
      { field: 'firma', header: 'Firma' },
      { field: 'email', header: 'E-mail' },
      { field: 'numer', header: 'Numer' },
      { field: 'status', header: 'Status' },
      { field: 'utworzone', header: 'Utworzone' },
      { field: 'zaktualizowane', header: 'Zaktualizowane' },
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));
  }

  openNew() {
    this.router.navigate(['/sets/new']);
  }

  editSet(id: number) {
    this.router.navigate([`/sets/${id}`]);
  }

  onGlobalFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (this.dt) {
      this.dt.filterGlobal(inputElement.value, 'contains');
    }
  }
}
