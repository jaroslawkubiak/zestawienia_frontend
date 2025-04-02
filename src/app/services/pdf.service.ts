import { ElementRef, Injectable, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ISet } from '../components/sets/types/ISet';
import { IPosition } from '../components/sets/types/IPosition';
import { columnList } from '../components/sets/edit-set/column-list';
import { calculateBrutto, calculateWartosc } from '../shared/helpers/calculate';
import { Observable } from 'rxjs';

interface IImage {
  base64: string;
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  @ViewChild('tabela', { static: false }) tabela!: ElementRef;
  robotoRegularBase64: string = '';
  robotoBoldBase64: string = '';
  pageWidth: number = 0;
  pageHeight: number = 0;
  columnList = columnList;
  colors = {
    accent: '#3bbfa1',
    accentLighter: '#e5fff9',
    accentDarker: '#2f9880',
    black: '#000',
    gray: '#888',
    white: '#fff',
  };

  COLUMN_HEIGHT = 50;
  BASE_URL = 'http://localhost:3005/uploads/sets/';

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

  async generatePDF(set: ISet, positions: IPosition[]) {
    if (!this.robotoRegularBase64 || !this.robotoBoldBase64) {
      console.error('Czcionki jeszcze się nie załadowały!');
      return;
    }

    const sortPositions = positions.sort(
      (a, b) => a.bookmarkId.id - b.bookmarkId.id
    );

    // get all image before creating PDF
    const imageMap = new Map<string, IImage>();
    await Promise.all(
      sortPositions.map(async (row) => {
        const imageUrl = `${this.BASE_URL}${set.id}/positions/${row.id}/${row.image}`;
        try {
          const base64Image = await this.getBase64Image(imageUrl);
          const { width, height } = await this.getImageSize(
            base64Image as string
          );
          imageMap.set(row.id + '/' + row.image, {
            base64: base64Image as string,
            width,
            height,
          });
        } catch (error) {
          console.error(`Błąd ładowania obrazu ${imageUrl}`, error);
        }
      })
    );

    // create doc 'p' = portret, 'l' = landscape
    const doc = new jsPDF('l', 'mm', 'a2');
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
    doc.setTextColor(this.colors.black);

    const headers = [
      this.columnList.filter((col) => !col.classHeader).map((col) => col.name),
    ];

    const data = await Promise.all(
      sortPositions.map(async (row: IPosition) => {
        const brutto = row.netto ? calculateBrutto(row.netto) : '';

        return [
          row.id + '/' + row.image,
          row.produkt,
          row.producent,
          row.supplierId ? row.supplierId.firma : '',
          row.kolekcja,
          row.nrKatalogowy,
          row.kolor,
          row.ilosc,
          row.netto,
          brutto,
          row.ilosc ? calculateWartosc(row.ilosc, row.netto) : '',
          brutto ? calculateWartosc(row.ilosc, brutto) : '',
          row.pomieszczenie,
          row.link,
        ];
      })
    );

    // table
    autoTable(doc, {
      head: headers,
      body: data,
      margin: 0,
      didParseCell: (data) => {
        if (
          data.cell.raw &&
          data.row.section === 'body' &&
          data.column.index === 13
        ) {
          data.cell.text = ['LINK'];
          data.cell.styles.textColor = '#2f9880';
          (data.cell as any).link = data.cell.raw;
        }
      },

      didDrawCell: (data) => {
        if (
          data.row.section === 'body' &&
          data.column.index === 0 &&
          data.row.index >= 0
        ) {
          console.log(data.cell.raw);
          const imageKey = data.cell.raw as string;
          const imageInfo = imageMap.get(imageKey);
          data.cell.text = [];
          data.cell.raw = '';

          if (imageInfo) {
            let imgWidth = this.COLUMN_HEIGHT; // max width
            let imgHeight = (imageInfo.height / imageInfo.width) * imgWidth;

            if (imgHeight > this.COLUMN_HEIGHT) {
              imgHeight = this.COLUMN_HEIGHT;
              imgWidth = (imageInfo.width / imageInfo.height) * imgHeight;
            }

            // count align center position for image
            const xCenter = data.cell.x + (data.cell.width - imgWidth) / 2;
            const yCenter = data.cell.y + (data.cell.height - imgHeight) / 2;

            doc.addImage(
              imageInfo.base64,
              'PNG',
              xCenter,
              yCenter,
              imgWidth,
              imgHeight
            );
          }
        }

        // for links in column Link
        if (data.column.index === 13 && data.cell.raw) {
          const url = data.cell.raw as string;

          doc.link(
            data.cell.x,
            data.cell.y,
            data.cell.width,
            data.cell.height,
            { url }
          );
        }
      },
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
        cellPadding: {
          top: 22,
          bottom: 22,
          right: 3,
          left: 3,
        },
      },

      // theme: 'striped',
      columnStyles: {
        0: { cellWidth: this.COLUMN_HEIGHT }, // set width first column
        1: { cellWidth: 70 }, // set width second column
      },
    });

    // draw header and footer for every page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      this.drawRectLeft(doc, 0, 10, 10, `Zestawienie : ${set.name}`);
      this.drawRectRight(doc, 0, 10, 10, set.clientId.firma);

      this.drawRectFull(
        doc,
        this.pageHeight - 14,
        8,
        8,
        `Strona ${i} z ${totalPages}`
      );
      this.drawRectFull(
        doc,
        this.pageHeight - 6,
        8,
        8,
        'Copyright @2025 Żurawicki Design'
      );
    }

    // save PDF file
    //TODO send file to backend
    // doc.save('tabelaimage.pdf');

    // open in new window, file dont download
    const pdfUrl = doc.output('bloburl'); // Generuje URL do PDF
    window.open(pdfUrl, '_blank'); // Otwiera w nowej karcie
  }

  drawRectLeft(
    doc: jsPDF,
    posY: number,
    rectHeight: number,
    font: number,
    text: string
  ) {
    doc.setFontSize(font);
    doc.setFillColor(this.colors.gray);

    const rectWidth = this.pageWidth / 2;
    const posX = 0;

    doc.rect(posX, posY, rectWidth, rectHeight, 'F');

    const textWidth = doc.getTextWidth(text);
    const textX = posX + (rectWidth - textWidth) / 2;
    const textY = posY + rectHeight / 1.5;

    doc.text(text, textX, textY);
  }
  drawRectRight(
    doc: jsPDF,
    posY: number,
    rectHeight: number,
    font: number,
    text: string
  ) {
    doc.setFontSize(font);
    doc.setFillColor(this.colors.gray);

    const rectWidth = this.pageWidth / 2;
    const posX = this.pageWidth / 2;

    doc.rect(posX, posY, rectWidth, rectHeight, 'F');

    const textWidth = doc.getTextWidth(text);
    const textX = posX + (rectWidth - textWidth) / 2;
    const textY = posY + rectHeight / 1.5;

    doc.text(text, textX, textY);
  }
  drawRectFull(
    doc: jsPDF,
    posY: number,
    rectHeight: number,
    font: number,
    text: string
  ) {
    doc.setFontSize(font);
    doc.setFillColor(this.colors.gray);

    const rectWidth = this.pageWidth;
    const posX = 0;

    doc.rect(posX, posY, rectWidth, rectHeight, 'F');

    const textWidth = doc.getTextWidth(text);
    const textX = posX + (rectWidth - textWidth) / 2;
    const textY = posY + rectHeight / 1.5;

    doc.text(text, textX, textY);
  }

  async getImageSize(
    base64Image: string
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Image;
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
    });
  }

  async getBase64Image(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
