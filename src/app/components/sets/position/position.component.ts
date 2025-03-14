import { IPosition } from './IPosition';
import { Component, OnInit, Input } from '@angular/core';
// import { ProductService } from '@/service/productservice';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

interface IColumnList {
  name: string;
  value: string;
  type: 'string' | 'number';
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
    {
      name: 'PRODUKT',
      value: 'produkt',
      type: 'string',
    },
    {
      name: 'PRODUCENT',
      value: 'producent',
      type: 'string',
    },
    {
      name: 'KOLEKCJA/SERIA',
      value: 'kolekcja',
      type: 'string',
    },
    {
      name: 'NR KATALOGOWY',
      value: 'nrKatalogowy',
      type: 'string',
    },
    {
      name: 'KOLOR',
      value: 'kolor',
      type: 'string',
    },
    // {
    //   name: 'ILOŚĆ',
    //   value: 'ilosc',
    //   type: 'number',
    // },
    // {
    //   name: 'CENA NETTO',
    //   value: 'netto',
    //   type: 'number',
    // },
    // {
    //   name: 'CENA BRUTTO',
    //   value: 'brutto',
    //   type: 'number',
    // },
    // {
    //   name: 'WARTOŚĆ NETTO',
    //   value: 'wartoscNetto',
    //   type: 'number',
    // },
    // {
    //   name: 'WARTOŚĆ BRUTTO',
    //   value: 'wartoscBrutto',
    //   type: 'number',
    // },
    // {
    //   name: 'DOSTAWCA',
    //   value: 'dostawca',
    //   type: 'string',
    // },
    // {
    //   name: 'POMIESZCZENIE',
    //   value: 'pomieszczenie',
    //   type: 'string',
    // },
    // {
    //   name: 'LINK',
    //   value: 'link',
    //   type: 'string',
    // },
  ];

  // image: image;

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
