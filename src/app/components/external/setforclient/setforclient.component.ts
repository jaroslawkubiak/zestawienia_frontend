import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  calculateBrutto,
  calculateWartosc,
} from '../../../shared/helpers/calculate';
import { FilesService } from '../../files/files.service';
import { IFileList } from '../../files/IFileList';
import { EditSetService } from '../../sets/edit-set/edit-set.service';
import { IPosition } from '../../sets/types/IPosition';
import { ISet } from '../../sets/types/ISet';
import { ShowFilesComponent } from '../../files/show-files/show-files.component';
import { SendFilesComponent } from '../../files/send-files/send-files.component';

@Component({
  selector: 'app-setforclient',
  imports: [
    CommonModule,
    TooltipModule,
    SendFilesComponent,
    ShowFilesComponent,
  ],
  templateUrl: './setforclient.component.html',
  styleUrl: './setforclient.component.css',
})
export class SetforclientComponent implements OnInit {
  setId!: number;
  hash: string | null = null;
  set!: ISet;
  positions: IPosition[] = [];
  files: IFileList | undefined = undefined;
  FILES_URL = environment.FILES_URL;

  @ViewChild(ShowFilesComponent, { static: false })
  dialogShowFilesComponent!: ShowFilesComponent;
  @ViewChild(SendFilesComponent, { static: false })
  dialogSendFilesComponent!: SendFilesComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private filesService: FilesService,
    private editSetService: EditSetService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.setId = Number(params.get('id'));
      this.hash = params.get('hash');
      if (this.setId && this.hash) {
        this.editSetService
          .validateSetAndHash(this.setId, this.hash)
          .subscribe({
            next: (response) => {
              if (!response) {
                this.router.navigate([`/notfound`]);
              } else {
                this.loadData();
              }
            },
            error: (err) => {
              this.router.navigate([`/notfound`]);
            },
          });
      }
    });
  }

  loadData() {
    forkJoin({
      set: this.editSetService.getSet(this.setId),
      positions: this.editSetService.getPositions(this.setId),
    }).subscribe(({ set, positions }) => {
      this.set = set;
      this.positions = positions.map((item) => {
        let imageUrl = '';
        if (item.image) {
          imageUrl = [
            this.FILES_URL,
            this.setId,
            'positions',
            item.id,
            item.image,
          ].join('/');
        }
        const brutto = calculateBrutto(item.netto);

        return {
          ...item,
          brutto,
          wartoscNetto: calculateWartosc(item.ilosc, item.netto),
          wartoscBrutto: calculateWartosc(item.ilosc, brutto),
          imageUrl,
        };
      });
      this.files = set?.files;

      this.sortByBookmarkAndOrder(this.positions);
    });
  }

  sortByBookmarkAndOrder(data: any[]) {
    return data.sort((a, b) => {
      if (a.bookmarkId.id !== b.bookmarkId.id) {
        return a.bookmarkId.id - b.bookmarkId.id;
      }
      return a.kolejnosc - b.kolejnosc;
    });
  }

  downloadPdf() {
    if (!this.files?.pdf) {
      return;
    }

    const filesList = this.filesService.preparePdfFilesList(
      this.setId,
      this.files
    );

    const sortedFiles = filesList.sort((a, b) => {
      const dateA = this.extractDateFromFilename(a.name);
      const dateB = this.extractDateFromFilename(b.name);
      return dateB.getTime() - dateA.getTime();
    });

    this.filesService.downloadAndSaveFile(this.setId, sortedFiles[0]);
  }

  extractDateFromFilename(filename: string): Date {
    const match = filename.match(/(\d{2}-\d{2}-\d{4}-\d{2}-\d{2}-\d{2})/);
    if (!match)
      throw new Error(`Nie znaleziono daty w nazwie pliku: ${filename}`);

    const [day, month, year, hour, minute, second] = match[1]
      .split('-')
      .map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  }

  showAttachedFiles() {
    this.editSetService.getSetFiles(this.setId).subscribe({
      next: (response: IFileList) => {
        this.dialogShowFilesComponent.showDialog(
          this.setId,
          this.set.name,
          response
        );
      },
    });
  }

  openSendFilesDialog(setId: number, setName: string) {
    this.dialogSendFilesComponent.openSendFilesDialog(setId, setName);
  }
}
