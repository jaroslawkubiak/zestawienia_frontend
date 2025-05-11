import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
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
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { SendFilesComponent } from '../files/send-files/send-files.component';
import { ShowFilesComponent } from '../files/show-files/show-files.component';
import { IFileFullDetails } from '../files/types/IFileFullDetails';
import { SetsService } from './sets.service';
import { ISet } from './types/ISet';
import { SetStatus } from './types/set-status.enum';
import { IDeletedFiles } from '../files/types/IDeletedFiles';

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
    BadgeModule,
    CheckboxModule,
    SendFilesComponent,
    ShowFilesComponent,
  ],
  providers: [NotificationService, ConfirmationModalService],
})
export class SetsComponent implements OnInit {
  isLoading = true;
  sets: ISet[] = [];
  allSets: ISet[] = [];
  @ViewChild('dt') dt!: Table;
  statusesList = SetStatus;
  hideClosedSets = true;

  @ViewChild(SendFilesComponent, { static: false })
  dialogSendFilesComponent!: SendFilesComponent;

  @ViewChild(ShowFilesComponent, { static: false })
  dialogShowFilesComponent!: ShowFilesComponent;
  showClosed = false;

  constructor(
    private router: Router,
    private setsService: SetsService,
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
          fullName: set.clientId.firstName + ' ' + set.clientId.lastName,
        }));

        this.sets = this.sets.map((set) => ({
          ...set,
          newComments: set.comments
            ? this.setsService.countNewComments(set.comments, 'user')
            : undefined,
        }));

        this.allSets = this.sets;
        this.filterSets();

        this.isLoading = false;
        this.cd.markForCheck();
      },
      error: (err) => console.error('Error getting sets ', err),
    });
  }

  // filter sets - hide archived sets on list
  filterSets() {
    this.sets = this.hideClosedSets
      ? this.allSets.filter((item) => item.status !== SetStatus.archive)
      : [...this.allSets];
  }

  addNew() {
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
        setToDelete?.clientId.firstName +
        setToDelete?.clientId.lastName +
        '?<br />Spowoduje to usunięcie również wszystkich przesłanych zdjęć do zestawienia.',
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

  showAttachedFiles(set: ISet) {
    this.dialogShowFilesComponent.showDialog(set);
  }

  // update attached files after sending new files to server
  updateAttachedFiles(uploadedFiles: IFileFullDetails[]) {
    const uploadedSetId = +uploadedFiles[0].setId;
    this.sets = this.sets.map((set) =>
      set.id === uploadedSetId
        ? { ...set, files: [...(set.files || []), ...uploadedFiles] }
        : set
    );
  }

  showComments(setId: number) {
    const backPath = '/sets';

    this.router.navigate([`/sets/comments/${setId}`], {
      state: { backPath },
    });
  }

  showClosedSets() {
    this.hideClosedSets = !this.hideClosedSets;
    this.filterSets();
  }

  // when delete files - refresh badge
  onDeleteFile(deletedFiles: IDeletedFiles) {
    const { setId, files } = deletedFiles;

    this.sets = this.sets.map((item) =>
      item.id === setId ? { ...item, files: files } : item
    );
  }
}
