import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EditSetService } from '../sets/edit-set/edit-set.service';
import { IPosition } from '../sets/types/IPosition';
import { ISet } from '../sets/types/ISet';
import { IFileList } from '../../services/types/IFileList';
import { CommonModule } from '@angular/common';
import {
  calculateBrutto,
  calculateWartosc,
} from '../../shared/helpers/calculate';

@Component({
  selector: 'app-setforclient',
  imports: [CommonModule],
  templateUrl: './setforclient.component.html',
  styleUrl: './setforclient.component.css',
})
export class SetforclientComponent implements OnInit {
  setId!: number;
  hash: string | null = null;
  set!: ISet;
  positions: IPosition[] = [];
  files: IFileList | undefined = undefined;
  BASE_IMAGE_URL = 'http://localhost:3005/uploads/sets';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
            this.BASE_IMAGE_URL,
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
}
