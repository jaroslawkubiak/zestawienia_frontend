import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { map, switchMap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { bookarksDefaultColumnWidth } from '../../bookmarks/bookmarks-width';
import { EditSetService } from '../../sets/edit-set/edit-set.service';
import { ISet } from '../../sets/types/ISet';
import { ColumnListForSupplier } from './ColumnListForSupplier';
import { IClientData } from './types/IClientData';
import { IPositionForSupplier } from './types/IPositionForSupplier';
import { ISupplierData } from './types/ISupplierData';
import { IValidSetForSupplier } from './types/IValidSetForSupplier';

@Component({
  selector: 'app-for-supplier',
  imports: [TableModule, CommonModule, LoadingSpinnerComponent],
  standalone: true,

  templateUrl: './for-supplier.component.html',
  styleUrl: './for-supplier.component.css',
})
export class ForSupplierComponent implements OnInit {
  setId: number | null = null;
  setHash: string | null = null;
  setName: string | null = null;
  client!: IClientData;
  supplier!: ISupplierData;
  positions: IPositionForSupplier[] = [];
  FILES_URL = environment.FILES_URL;
  isLoading = true;

  defaultColumnWidth = 120;
  linkColumnWidth = 90;

  columnWidthMap = new Map(
    bookarksDefaultColumnWidth.map((col) => [col.name, col.width]),
  );

  columnListForSupplierWithWidth = ColumnListForSupplier.map((col) => ({
    ...col,
    width:
      col.name === 'LINK'
        ? this.linkColumnWidth
        : (this.columnWidthMap.get(col.name) ?? this.defaultColumnWidth),
  }));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private editSetService: EditSetService,
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((params) => ({
          setHash: params.get('setHash'),
          supplierHash: params.get('supplierHash'),
        })),
        switchMap(({ setHash, supplierHash }) => {
          this.setHash = setHash;
          if (!setHash || !supplierHash) {
            return throwError(() => new Error('Invalid params'));
          }

          return this.editSetService.validateSetAndHashForSupplier(
            setHash,
            supplierHash,
          );
        }),
      )
      .subscribe({
        next: (response: IValidSetForSupplier | null) => {
          if (response && response.valid && response.setId) {
            this.setId = response.setId;
            this.setName = response.setName;

            this.client = { ...response.client };
            this.supplier = { ...response.supplier };

            this.modifyData(response.positions);
          } else {
            this.router.navigate(['/notfound']);
          }
        },
        error: () => {
          this.router.navigate(['/notfound']);
        },
      });
  }

  // modify positions data: get status, image url, calculate brutto
  modifyData(positions: IPositionForSupplier[]) {
    this.positions = positions.map((item) => {
      let imageUrl = '';
      if (item.image) {
        imageUrl = [
          this.FILES_URL,
          'sets',
          this.setId,
          this.setHash,
          'positions',
          item.id,
          item.image,
        ].join('/');
      }
      this.isLoading = false;

      return {
        ...item,
        imageUrl,
      };
    });
  }
}
