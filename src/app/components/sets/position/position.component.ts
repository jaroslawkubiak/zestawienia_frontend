// import { IPosition } from './IPosition';
import { Component, OnInit, Input } from '@angular/core';
// import { ProductService } from '@/service/productservice';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

interface IPosition {
  kolor: string;
  ilosc: number;
  netto: number;
}
interface IColumnList {
  name: string;
  value: string;
}

@Component({
  selector: 'app-position',
  templateUrl: './position.component.html',
  styleUrl: './position.component.css',
  standalone: true,
  imports: [
    TableModule,
    InputTextModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
})
export class PositionComponent implements OnInit {
  @Input() positions: IPosition[] = [];

  columnList: IColumnList[] = [
    // {
    //   name: 'PRODUKT',
    //   value: 'produkt',
    // },
    // {
    //   name: 'PRODUCENT',
    //   value: 'producent',
    // },
    // {
    //   name: 'KOLEKCJA/SERIA',
    //   value: 'kolekcja',
    // },
    // {
    //   name: 'NR KATALOGOWY',
    //   value: 'nrKatalogowy',
    // },
    {
      name: 'KOLOR',
      value: 'kolor',
    },
    {
      name: 'ILOŚĆ',
      value: 'ilosc',
    },
    {
      name: 'CENA NETTO',
      value: 'netto',
    },
    // {
    //   name: 'CENA BRUTTO',
    //   value: 'brutto'
    //
    // },
    // {
    //   name: 'WARTOŚĆ NETTO',
    //   value: 'wartoscNetto'
    //
    // },
    // {
    //   name: 'WARTOŚĆ BRUTTO',
    //   value: 'wartoscBrutto'
    //
    // },
    // {
    //   name: 'DOSTAWCA',
    //   value: 'dostawca'
    //
    // },
    // {
    //   name: 'POMIESZCZENIE',
    //   value: 'pomieszczenie'
    //
    // },
    // {
    //   name: 'LINK',
    //   value: 'link'
    //
    // },
  ];

  // constructor(private productService: ProductService) {}
  editedCell: { column: string; rowIndex: number } | null = null;
  ngOnInit() {
    this.positions = this.positions.map((item) => {
      const brutto = countBrutto(item.netto);
      return {
        ...item,
        brutto,
        wartoscNetto: countSum(item.netto, item.ilosc),
        wartoscBrutto: countSum(brutto, item.ilosc),
      };
    });
    // console.log(`##### position #####`);
    // console.log(this.positions);
  }

  onEditInit(position: any, column: string) {
    console.log('Edycja rozpoczęta', position, column);
  }

  onEditComplete(position: any, column: string) {
    console.log('Edycja zakończona', position, column);
  }
}

function countBrutto(netto: number): number {
  return Number((netto * 1.23).toFixed(2));
}

function countSum(cena: number, ilosc: number): number {
  return Number((cena * ilosc).toFixed(2));
}
