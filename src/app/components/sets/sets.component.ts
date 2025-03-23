import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { IColumn, IExportColumn } from '../../shared/types/ITable';
import { SetsService } from './sets.service';
import { ISet } from './types/ISet';

@Component({
  selector: 'app-sets',
  templateUrl: './sets.component.html',
  styleUrl: './sets.component.css',
  standalone: true,
  imports: [
    ToolbarModule,
    TableModule,
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
    LoadingSpinnerComponent,
    TooltipModule,
  ],
})
export class SetsComponent implements OnInit {
  isLoading = true;
  sets: ISet[] = [];
  @ViewChild('dt') dt!: Table;
  cols!: IColumn[];
  exportColumns!: IExportColumn[];

  constructor(
    private router: Router,
    private setsService: SetsService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getSets();
  }

  getSets() {
    this.setsService.getSets().subscribe({
      next: (data) => {
        this.sets = data;
        this.isLoading = false;
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
