import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
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
import { ConfirmationModalService } from '../../services/confirmation.service';
import { NotificationService } from '../../services/notification.service';
import { IConfirmationMessage } from '../../services/types/IConfirmationMessage';
import { IFileList } from '../../services/types/IFileList';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { IColumn, IExportColumn } from '../../shared/types/ITable';
import { EditSetService } from './edit-set/edit-set.service';
import { SendFilesComponent } from './send-files/send-files.component';
import { SetsService } from './sets.service';
import { ShowFilesComponent } from './show-files/show-files.component';
import { ISet } from './types/ISet';
import { SetStatus } from './types/SetStatus';

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
    SendFilesComponent,
    ShowFilesComponent,
    BadgeModule,
  ],
  providers: [NotificationService, ConfirmationModalService],
})
export class SetsComponent implements OnInit {
  isLoading = true;
  sets: ISet[] = [];
  @ViewChild('dt') dt!: Table;
  cols!: IColumn[];
  exportColumns!: IExportColumn[];
  statusesList = SetStatus;

  @ViewChild(SendFilesComponent, { static: false })
  dialogSendFilesComponent!: SendFilesComponent;

  @ViewChild(ShowFilesComponent, { static: false })
  dialogShowFilesComponent!: ShowFilesComponent;

  constructor(
    private router: Router,
    private setsService: SetsService,
    private editSetService: EditSetService,
    private notificationService: NotificationService,
    private confirmationModalService: ConfirmationModalService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getSets();
  }

  getSets() {
    this.setsService.getSets().subscribe({
      next: (data) => {
        this.sets = data.map((set) => ({
          ...set,
          hasFiles:
            !!set.files &&
            (set.files?.files.length !== 0 || set.files.pdf.length !== 0),
        }));

        this.sets = this.sets.map((set) => ({
          ...set,
          newComments: set.comments
            ? this.setsService.countNewComments(set.comments)
            : undefined,
        }));

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

  editSet(setId: number) {
    this.router.navigate([`/sets/${setId}`]);
  }

  deleteSet(id: number) {
    const setToDelete = this.sets.find((item) => item.id === id);

    const accept = () => {
      this.setsService.remove(id).subscribe({
        next: (data) => {
          this.notificationService.showNotification(
            'success',
            'Zestawienie zostało usunięte'
          );
          this.sets = this.sets.filter((val) => val.id !== id);
        },
        error: (err) => console.error('Error getting sets ', err),
      });
    };

    const confirmMessage: IConfirmationMessage = {
      message:
        'Czy na pewno chcesz usunąć zestawienie ' +
        setToDelete?.name +
        ' dla ' +
        setToDelete?.clientId.firma +
        ' ?<br />Spowoduje to usunięcie również wszystkich przesłynych zdjęć do zestawienia.',
      header: 'Potwierdź usunięcie zestawienia',
      accept,
    };

    this.confirmationModalService.showConfirmation(confirmMessage);
  }

  onGlobalFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (this.dt) {
      this.dt.filterGlobal(inputElement.value, 'contains');
    }
  }

  openSendFilesDialog(setId: number, setName: string) {
    this.dialogSendFilesComponent.openSendFilesDialog(setId, setName);
  }

  showAttachedFiles(setId: number, setName: string) {
    this.editSetService.getSetFiles(setId).subscribe({
      next: (response: IFileList) => {
        this.dialogShowFilesComponent.showDialog(setId, setName, response);
      },
    });
  }
}
