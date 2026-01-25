import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { forkJoin, map, switchMap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  calculateBrutto,
  calculateWartosc,
} from '../../../shared/helpers/calculate';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { bookarksDefaultColumnWidth } from '../../bookmarks/bookmarks-width';
import { EditSetService } from '../../sets/edit-set/edit-set.service';
import { FooterService } from '../../sets/edit-set/footer.service';
import { PositionStatusList } from '../../sets/PositionStatusList';
import { IFooterRow } from '../../sets/types/IFooterRow';
import { IPosition } from '../../sets/types/IPosition';
import { IPositionStatus } from '../../sets/types/IPositionStatus';
import { ISet } from '../../sets/types/ISet';
import { ColumnListForSupplier } from './ColumnListForSupplier';

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
  supplierHash: string | null = null;
  supplierId: number | undefined = undefined;
  supplierCompany: string | undefined = undefined;
  set!: ISet;
  positions: IPosition[] = [];
  FILES_URL = environment.FILES_URL;
  isLoading = true;
  footerRow: IFooterRow[] = [
    {
      name: 'lp',
      key: 'lp',
      type: 'number',
    },
    ...ColumnListForSupplier,
  ];

  defaultColumnWidth = 120;
  linkColumnWidth = 90;

  columnWidthMap = new Map(
    bookarksDefaultColumnWidth.map((col) => [col.name, col.width]),
  );

  columnListForSupplierWithWidth = ColumnListForSupplier.map((col) => {
    console.log(col);
    return {
      ...col,
      width:
        col.name === 'LINK'
          ? this.linkColumnWidth
          : (this.columnWidthMap.get(col.name) ?? this.defaultColumnWidth),
    };
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private editSetService: EditSetService,
    private footerService: FooterService,
  ) {}

  ngOnInit() {
    console.log(this.columnListForSupplierWithWidth);
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
        next: (response) => {
          if (response.setId) {
            this.setId = response.setId;
            this.supplierId = response.supplierId;
            this.supplierCompany = response.supplierCompany;
            this.loadData();
          } else {
            this.router.navigate(['/notfound']);
          }
        },
        error: () => {
          this.router.navigate(['/notfound']);
        },
      });
  }

  loadData() {
    if (!this.setId || !this.supplierId) {
      this.router.navigate(['/notfound']);
      return;
    }
    forkJoin({
      positions: this.editSetService.getPositionsForSupplier(
        this.setId,
        this.supplierId,
      ),
    }).subscribe(({ positions }) => {
      this.positions = positions.map((item) => {
        const statusObj: IPositionStatus =
          PositionStatusList.filter(
            (statusItem) => item.status === statusItem.label,
          )[0] || PositionStatusList[0];

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
        const brutto = calculateBrutto(item.netto);
        this.isLoading = false;

        return {
          ...item,
          status: statusObj ? statusObj : item.status,
          brutto,
          wartoscNetto: calculateWartosc(item.ilosc, item.netto),
          wartoscBrutto: calculateWartosc(item.ilosc, brutto),
          imageUrl,
        };
      });

      this.calculateFooterRow();
    });
  }

  // calculate values for footer row
  calculateFooterRow(): void {
    this.footerRow = this.footerService.calculateFooterRow(
      this.footerRow,
      this.positions,
    );
  }
}
