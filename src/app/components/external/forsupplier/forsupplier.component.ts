import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  calculateBrutto,
  calculateWartosc,
} from '../../../shared/helpers/calculate';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { EditSetService } from '../../sets/edit-set/edit-set.service';
import { FooterService } from '../../sets/edit-set/footer.service';
import { PositionStatusList } from '../../sets/PositionStatusList';
import { IFooterRow } from '../../sets/types/IFooterRow';
import { IPosition } from '../../sets/types/IPosition';
import { IPositionStatus } from '../../sets/types/IPositionStatus';
import { ISet } from '../../sets/types/ISet';
import { ColumnListForSupplier } from './ColumnListForSupplier';

@Component({
  selector: 'app-forsupplier',
  imports: [TableModule, CommonModule, LoadingSpinnerComponent],
  standalone: true,

  templateUrl: './forsupplier.component.html',
  styleUrl: './forsupplier.component.css',
})
export class ForsupplierComponent implements OnInit {
  setId!: number;
  hash: string | null = null;
  supplierHash: string | null = null;
  supplierId: number | undefined = undefined;
  set!: ISet;
  positions: IPosition[] = [];
  FILES_URL = environment.FILES_URL;
  isLoading = true;
  columnList = ColumnListForSupplier;
  footerRow: IFooterRow[] = [
    {
      name: 'lp',
      key: 'lp',
      type: 'number',
    },
    ...ColumnListForSupplier,
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private editSetService: EditSetService,
    private footerService: FooterService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.setId = Number(params.get('id'));
      this.hash = params.get('hash');
      this.supplierHash = params.get('supplierHash');
      if (this.setId && this.hash && this.supplierHash) {
        this.editSetService
          .validateSetAndHashForSupplier(
            this.setId,
            this.hash,
            this.supplierHash
          )
          .subscribe({
            next: (response) => {
              this.supplierId = response.supplierId;
              if (!response || !response.isValid) {
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
    if (this.supplierId)
      forkJoin({
        set: this.editSetService.getSetForSupplier(this.setId, this.supplierId),
        positions: this.editSetService.getPositionsForSupplier(
          this.setId,
          this.supplierId
        ),
      }).subscribe(({ set, positions }) => {
        this.set = set;

        this.positions = positions.map((item) => {
          const statusObj: IPositionStatus =
            PositionStatusList.filter(
              (statusItem) => item.status === statusItem.label
            )[0] || PositionStatusList[0];

          let imageUrl = '';
          if (item.image) {
            imageUrl = [
              this.FILES_URL,
              'sets',
              this.setId,
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
      this.positions
    );
  }
}
