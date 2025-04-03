import { ElementRef, Injectable, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { columnList } from '../components/sets/edit-set/column-list';
import { IPosition } from '../components/sets/types/IPosition';
import { ISet } from '../components/sets/types/ISet';
import { calculateBrutto, calculateWartosc } from '../shared/helpers/calculate';

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
    red: '#F00',
    green: '#0f0',
    blue: '#00f',
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

    // create doc 'p' = portret, 'l' = landscape
    const doc = new jsPDF('l', 'mm', 'a2');
    this.pageWidth = Math.floor(doc.internal.pageSize.width);
    this.pageHeight = Math.floor(doc.internal.pageSize.height);

    // Add font to PDF
    doc.addFileToVFS('Roboto-Regular.ttf', this.robotoRegularBase64);
    doc.addFileToVFS('Roboto-Bold.ttf', this.robotoBoldBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
    doc.setFont('Roboto', 'bold');
    // set default font and text color
    doc.setFontSize(10);
    doc.setTextColor(this.colors.black);

    const headers = [
      this.columnList.filter((col) => !col.classHeader).map((col) => col.name),
    ];

    const countsBookmarks = positions.map((pos) => {
      return pos.bookmarkId.id;
    });

    const uniqueBookmarksCount = new Set(countsBookmarks).size;

    // main loop for every bookmark in set
    await Promise.all(
      set.bookmarks.map(async (bookmark, index) => {
        const sortPositions = positions
          .filter((pos) => pos.bookmarkId.id === bookmark.id)
          .sort((a, b) => a.kolejnosc - b.kolejnosc);

        // return if no position in current bookmark
        if (sortPositions.length === 0) {
          return;
        }

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

        const footer: any = [['', '', '', '', '', '', 'kolor']];
        let totals = {
          ilosc: 0,
          netto: 0,
          brutto: 0,
          wartoscNetto: 0,
          wartoscBrutto: 0,
        };

        // prepare data to display
        const data = await Promise.all(
          sortPositions.map(async (row: IPosition) => {
            const brutto = row.netto ? calculateBrutto(row.netto) : 0;
            const wartoscNetto = row.ilosc
              ? calculateWartosc(row.ilosc, row.netto)
              : 0;
            const wartoscBrutto = brutto
              ? calculateWartosc(row.ilosc, brutto)
              : 0;

            totals.ilosc += row.ilosc;
            totals.netto += row.netto;
            totals.brutto += brutto;
            totals.wartoscNetto += wartoscNetto;
            totals.wartoscBrutto += wartoscBrutto;

            return [
              `${row.id}/${row.image}`,
              row.produkt,
              row.producent,
              row.supplierId?.firma || '',
              row.kolekcja,
              row.nrKatalogowy,
              row.kolor,
              row.ilosc,
              row.netto,
              brutto,
              wartoscNetto,
              wartoscBrutto,
              row.pomieszczenie,
              row.link,
            ];
          })
        );

        footer[0].push(totals.ilosc);
        footer[0].push(`${totals.netto.toFixed(2)} PLN`);
        footer[0].push(`${totals.brutto.toFixed(2)} PLN`);
        footer[0].push(`${totals.wartoscNetto.toFixed(2)} PLN`);
        footer[0].push(`${totals.wartoscBrutto.toFixed(2)} PLN`);
        this.drawBookmarkName(doc, bookmark.name);

        // table
        autoTable(doc, {
          head: headers,
          body: data,
          foot: footer,
          margin: 0,
          startY: 20,
          didParseCell: (data) => {
            // change link text to actual link
            if (
              data.cell.raw &&
              data.row.section === 'body' &&
              data.column.index === 13
            ) {
              data.cell.text = ['LINK'];
              data.cell.styles.textColor = '#2f9880';
              data.cell.styles.fontSize = 12;
              data.cell.styles.fontStyle = 'bold';
              (data.cell as any).link = data.cell.raw;
            }

            // remove image name from cell
            if (
              data.cell.raw &&
              data.row.section === 'body' &&
              data.column.index === 0
            ) {
              data.cell.text = [''];
            }
          },
          didDrawCell: (data) => {
            // for image type column
            if (
              data.row.section === 'body' &&
              data.column.index === 0 &&
              data.row.index >= 0
            ) {
              const imageKey = data.cell.raw as string;
              const imageInfo = imageMap.get(imageKey);

              if (imageInfo) {
                let imgWidth = this.COLUMN_HEIGHT; // max width
                let imgHeight = (imageInfo.height / imageInfo.width) * imgWidth;

                if (imgHeight > this.COLUMN_HEIGHT) {
                  imgHeight = this.COLUMN_HEIGHT;
                  imgWidth = (imageInfo.width / imageInfo.height) * imgHeight;
                }

                // count align center position for image
                const xCenter = data.cell.x + (data.cell.width - imgWidth) / 2;
                const yCenter =
                  data.cell.y + (data.cell.height - imgHeight) / 2;

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
            fillColor: this.colors.white,
            cellPadding: {
              top: Math.floor(this.COLUMN_HEIGHT / 2),
              bottom: Math.floor(this.COLUMN_HEIGHT / 2),
              right: 3,
              left: 3,
            },
          },
          footStyles: {
            font: 'Roboto',
            fontStyle: 'bold',
            halign: 'center',
            fillColor: '#2f9880',
          },
          theme: 'grid',
          columnStyles: {
            0: { cellWidth: this.COLUMN_HEIGHT }, // set width first column
            1: { cellWidth: 70 }, // set width second column
          },
        });

        if (index !== uniqueBookmarksCount) {
          doc.addPage();
        }
      })
    );

    // draw header and footer for every page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      this.drawRectLeft(
        doc,
        0,
        14,
        14,
        this.colors.red,
        `Zestawienie : ${set.name}`
      );
      this.drawRectRight(doc, 0, 14, 14, this.colors.white, set.clientId.firma);

      this.drawRectFull(
        doc,
        this.pageHeight - 20,
        10,
        12,
        this.colors.white,
        `Strona ${i} z ${totalPages}`
      );
      this.drawRectFull(
        doc,
        this.pageHeight - 10,
        10,
        12,
        this.colors.white,
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
    color: string,
    text: string
  ) {
    doc.setFontSize(font);
    // doc.setFont('Roboto', 'bold');
    doc.setFillColor(color);
    doc.setTextColor(this.colors.black);

    const rectWidth = this.pageWidth / 2;
    const posX = 0;

    // doc.rect(posX, posY, rectWidth, rectHeight, 'F');

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
    color: string,
    text: string
  ) {
    doc.setFontSize(font);
    doc.setFillColor(color);
    doc.setTextColor(this.colors.black);

    const rectWidth = this.pageWidth / 2;
    const posX = this.pageWidth / 2;

    // doc.rect(posX, posY, rectWidth, rectHeight, 'F');

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
    color: string,
    text: string
  ) {
    doc.setFontSize(font);
    doc.setFillColor(color);
    doc.setTextColor(this.colors.black);

    const rectWidth = this.pageWidth;

    // doc.rect(0, posY, rectWidth, rectHeight, 'F');

    const textWidth = doc.getTextWidth(text);
    const textX = (rectWidth - textWidth) / 2;
    const textY = posY + rectHeight / 1.5;

    doc.text(text, textX, textY);
  }

  drawBookmarkName(doc: jsPDF, text: string) {
    doc.setFontSize(20);
    doc.setFillColor(this.colors.accentLighter);
    doc.setTextColor(this.colors.black);

    const rectHeight = 20;
    const posY = 0;
    const padding = 30;
    const textWidth = doc.getTextWidth(text);
    const textX = (this.pageWidth - textWidth) / 2;

    // draw rectangle ajdusted to text width + padding
    // doc.rect(
    //   textX - padding,
    //   posY,
    //   textWidth + padding + padding,
    //   rectHeight,
    //   'F'
    // );

    //draw full width rectangle
    // doc.rect(0, posY, this.pageWidth, rectHeight, 'F');

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
