import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../login/auth.service';
import { SetsService } from './sets.service';
import { SetStatus } from './status';
import { ISet } from './ISet';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-sests',
  standalone: true,
  templateUrl: './sests.component.html',
  styleUrls: ['./sests.component.css', '../../shared/css/basic.css'],
  imports: [
    TableModule,
    TagModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    MultiSelectModule,
    SelectModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    SelectModule,
  ],
  providers: [SetsService],
})
export class SetsComponent implements OnInit {
  statuses!: any[];
  selectedStatus: any;

  loading: boolean = false;

  activityValues: number[] = [0, 100];

  public authorizationToken: string | null;
  sets: ISet[] = [];

  constructor(
    private setsService: SetsService,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {
    this.authorizationToken = this.authService.authorizationToken;
  }

  ngOnInit() {
    this.getSets();

    this.statuses = Object.entries(SetStatus).map(([key, value]) => ({
      name: value,
      value: key,
    }));
  }

  getSets() {
    this.setsService.getSets(this.authorizationToken).subscribe({
      next: (data) => {
        this.sets = data;
        this.loading = false;
        this.cd.markForCheck();
      },
      error: (err) => console.error('Error getting sets ', err),
    });
  }

  onGlobalFilter(event: Event, table: Table) {
    const input = event.target as HTMLInputElement;
    table.filterGlobal(input.value, 'contains');
  }
}
