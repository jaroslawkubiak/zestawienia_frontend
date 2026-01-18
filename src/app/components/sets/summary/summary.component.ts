import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { IPosition } from '../types/IPosition';
import { ISet } from '../types/ISet';
import { SummaryData } from '../types/ISummaryData';

@Component({
  selector: 'app-summary',
  imports: [TableModule, CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css',
})
export class SummaryComponent implements OnInit {
  @Input() set!: ISet;
  @Input() positions!: IPosition[];
  @Output() bookmarkSelected = new EventEmitter<number>();
  summaryData: SummaryData[] = [];

  ngOnInit(): void {
    const positions = this.positions ?? [];
    let total = 0;

    this.summaryData = this.set.bookmarks
      .filter((b) => b.id !== 1)
      .map((b, index) => {
        const value = positions.reduce((sum, p) => {
          if (p.bookmarkId.id !== b.id) return sum;

          const status = p.status;
          const include =
            !status || (typeof status === 'object' && status.summary);
          if (!include) return sum;

          return sum + (p.brutto ?? 0) * (p.ilosc ?? 0);
        }, 0);

        return {
          bookmarkId: b.id,
          bookmarkName: b.name,
          value,
          columnLp: index + 1,
        };
      });

    total = this.summaryData.reduce((sum, item) => sum + item.value, 0);
    this.summaryData.push({
      columnLp: null,
      bookmarkId: 1,
      bookmarkName: 'WARTOŚĆ CAŁKOWITA suma [zł/brutto]',
      value: total,
    });
  }

  selectBookmark(bookmarkId: number) {
    this.bookmarkSelected.emit(bookmarkId);
  }
}
