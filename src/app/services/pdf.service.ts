import { ElementRef, Injectable, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ISet } from '../components/sets/types/ISet';
import { IPosition } from '../components/sets/types/IPosition';
import { columnList } from '../components/sets/edit-set/column-list';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  @ViewChild('tabela', { static: false }) tabela!: ElementRef;
  robotoRegularBase64: string = '';
  robotoBoldBase64: string = '';
  pageWidth: number = 0;
  pageHeight: number = 0;
  fillR: number = 240;
  fillG: number = 240;
  fillB: number = 240;

  columnList = columnList;

  data = [
    {
      id: 1,
      name: 'Jan Kowalski',
      age: 30,
      name1: 'Jan Kowalski',
      age1: 30,
      name2: 'Jan Kowalski',
      age2: 30,
    },
    {
      id: 2,
      name: 'Anna Nowak',
      age: 25,
      name1: 'Jan Kowalski',
      age1: 30,
      name2: 'Jan Kowalski',
      age2: 30,
    },
    {
      id: 3,
      name: 'Piotr Wiśniewski',
      age: 35,
      name1: 'Jan Kowalski',
      age1: 30,
      name2: 'Jan Kowalski',
      age2: 30,
    },
    {
      id: 1,
      name: 'Jan Kowalski',
      age: 30,
      name1: 'Jan Kowalski',
      age1: 30,
      name2: 'Jan Kowalski',
      age2: 30,
    },
  ];

  constructor() {
    this.loadFont();
  }

  async loadFont() {
    // get base64 files for bold and normal Roboto font
    const responseRegular = await fetch('/assets/fonts/roboto-base64.txt');
    this.robotoRegularBase64 = await responseRegular.text();
    const responseBold = await fetch('/assets/fonts/roboto-base64-bold.txt');
    this.robotoBoldBase64 = await responseBold.text();
  }

  generatePDF(set: ISet, positions: IPosition[]) {
    if (!this.robotoRegularBase64 || !this.robotoBoldBase64) {
      console.error('Czcionki jeszcze się nie załadowały!');
      return;
    }

    const sortPositions = positions.sort(
      (a, b) => a.bookmarkId.id - b.bookmarkId.id
    );

    // create doc 'p' = portret, 'l' = landscape
    const doc = new jsPDF('l', 'mm', 'a4');
    this.pageWidth = Math.floor(doc.internal.pageSize.width);
    this.pageHeight = Math.floor(doc.internal.pageSize.height);

    // Add font to PDF
    doc.addFileToVFS('Roboto-Regular.ttf', this.robotoRegularBase64);
    doc.addFileToVFS('Roboto-Bold.ttf', this.robotoBoldBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
    doc.setFont('Roboto', 'normal');
    // set default font and text color
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);

    const headers = [
      this.columnList.filter((col) => !col.classTh).map((col) => col.name),
    ];

    const data = sortPositions.map((row: IPosition) => [
      row.produkt,
      row.producent,
      row.supplierId ? row.supplierId.firma : '',
      row.kolekcja,
      row.image,
      row.nrKatalogowy,
      row.kolor,
      row.ilosc,
      row.netto,
      '',
      '',
      '',
      row.pomieszczenie,
      row.link,
    ]);

    // table
    autoTable(doc, {
      head: headers,
      body: data,
      margin: 0,
      headStyles: {
        font: 'Roboto',
        fontStyle: 'bold',
        halign: 'center',
        fillColor: '#2f9880',
      },
      bodyStyles: {
        font: 'Roboto',
        fontStyle: 'normal',
        fillColor: '#e5fff9',
      },

      theme: 'striped',
    });

    // draw header and footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
  
      this.drawRectLeft(doc, 0, 10, 10, `Zestawienie : ${set.name}`);
      this.drawRectRight(doc, 0, 10, 10, set.clientId.firma);

      this.drawRectFull(doc, 200, 6, 8, `Strona ${i} z ${totalPages}`);
      this.drawRectFull(doc, 204, 6, 8, 'Copyright @2025 Żurawicki Design');
    }

    // save PDF file
    //TODO send file to backend
    doc.save('tabela.pdf');
  }

  drawRectLeft(
    doc: jsPDF,
    Y: number,
    rectHeight: number,
    font: number,
    text: string
  ) {
    doc.setFontSize(font);
    doc.setFillColor(this.fillR, this.fillG, this.fillB);

    const rectWidth = this.pageWidth / 2;
    const X = 0;

    doc.rect(X, Y, rectWidth, rectHeight, 'F');

    const textWidth = doc.getTextWidth(text);
    const posX = X + (rectWidth - textWidth) / 2;
    const posY = Y + rectHeight / 1.5;

    doc.text(text, posX, posY);
  }

  drawRectRight(
    doc: jsPDF,
    Y: number,
    rectHeight: number,
    font: number,
    text: string
  ) {
    doc.setFontSize(font);
    doc.setFillColor(this.fillR, this.fillG, this.fillB);

    const rectWidth = this.pageWidth / 2;
    const X = this.pageWidth / 2;

    doc.rect(X, Y, rectWidth, rectHeight, 'F');

    const textWidth = doc.getTextWidth(text);
    const posX = X + (rectWidth - textWidth) / 2;
    const posY = Y + rectHeight / 1.5;

    doc.text(text, posX, posY);
  }

  drawRectFull(
    doc: jsPDF,
    Y: number,
    rectHeight: number,
    font: number,
    text: string
  ) {
    doc.setFontSize(font);
    doc.setFillColor(this.fillR, this.fillG, this.fillB);

    const rectWidth = this.pageWidth;
    const X = 0;

    doc.rect(X, Y, rectWidth, rectHeight, 'F');

    const textWidth = doc.getTextWidth(text);
    const posX = X + (rectWidth - textWidth) / 2;
    const posY = Y + rectHeight / 1.5;

    doc.text(text, posX, posY);
  }
}
