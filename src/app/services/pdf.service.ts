import { ElementRef, Injectable, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ColumnList,
  IColumnList,
} from '../components/sets/edit-set/column-list';
import { IPosition } from '../components/sets/types/IPosition';
import { ISet } from '../components/sets/types/ISet';
import { calculateBrutto, calculateWartosc } from '../shared/helpers/calculate';
import { getFormatedDate } from '../shared/helpers/getFormatedDate';
import { FilesService } from './files.service';
import { NotificationService } from './notification.service';
type ColumnStyles = {
  [key: number]: {
    cellWidth: number | 'auto';
  };
};

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
  private robotoRegularBase64 = '';
  private robotoBoldBase64 = '';
  private pageWidth = 0;
  private pageHeight = 0;
  columnList: IColumnList[] = [
    {
      name: 'LP',
      key: 'lp',
      type: 'string',
      pdfWidth: 10,
    },
    ...ColumnList,
  ];
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
  ROW_HEIGHT = 60;
  IMAGE_HORIZONTAL_PADDING = 3;
  BASE_URL = 'http://localhost:3005/uploads/sets/';
  visibleColumns = this.columnList.filter(
    (col) => col.classHeader !== 'hidden'
  );

  headers: string[][] = [this.visibleColumns.map((col) => col.name)];
  columnStyles: ColumnStyles = {};

  constructor(
    private filesService: FilesService,
    private notificationService: NotificationService
  ) {
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
    const doc = new jsPDF('l', 'mm', 'a1');
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

    this.columnStyles = this.visibleColumns.reduce((styles, col, index) => {
      styles[index] = { cellWidth: col.pdfWidth || 'auto' };
      return styles;
    }, {} as { [key: number]: { cellWidth: number | 'auto' } });

    // find index of column needed in didDrawCell
    const columnIndexes = this.visibleColumns.reduce<{ [key: string]: number }>(
      (acc, col) => {
        const key = col.key;
        acc[col.key] = this.headers[0].findIndex(
          (name) =>
            name === this.visibleColumns.find((col) => col.key === key)?.name
        );
        return acc;
      },
      {}
    );

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
            if (!row.image) {
              return;
            }

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

        // totals for footer
        let totals = {
          ilosc: 0,
          netto: 0,
          brutto: 0,
          wartoscNetto: 0,
          wartoscBrutto: 0,
        };

        // prepare main body data to display
        const data = await Promise.all(
          sortPositions.map(async (row: IPosition, i: number) => {
            const netto = row.netto ? row.netto : 0;
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

            // prepare row in order according to visibleColumns
            const formatRow = (row: any) => {
              return this.visibleColumns.map((col) => {
                const key = col.key;

                // special case for couple columns ike image and supplier
                switch (key) {
                  case 'image':
                    return `${row.id}/${row.image}`;
                  case 'lp':
                    return i + 1;
                  case 'supplierId':
                    return row.supplierId?.firma || '';
                  case 'netto':
                    return netto.toFixed(2) + ' PLN';
                  case 'brutto':
                    return brutto.toFixed(2) + ' PLN';
                  case 'wartoscNetto':
                    return wartoscNetto.toFixed(2) + ' PLN';
                  case 'wartoscBrutto':
                    return wartoscBrutto.toFixed(2) + ' PLN';
                  default:
                    return row[key];
                }
              });
            };

            return formatRow(row);
          })
        );

        this.drawBookmarkName(doc, bookmark.name);

        // table
        autoTable(doc, {
          head: this.headers,
          body: data,
          margin: 0,
          startY: 20,
          tableWidth: 'wrap',
          didParseCell: (data) => {
            // change style for column LP
            if (data.column.index === 0) {
              data.cell.styles.fillColor = '#2f9880';
              data.cell.styles.textColor = '#fff';
              data.cell.styles.fontSize = 12;
              data.cell.styles.fontStyle = 'bold';
            }
            // change link text to actual link
            if (
              data.cell.raw &&
              data.row.section === 'body' &&
              data.column.index === columnIndexes['link']
            ) {
              data.cell.text = ['LINK'];
              data.cell.styles.textColor = '#2f9880';
              data.cell.styles.fontSize = 12;
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.halign = 'center';
              (data.cell as any).link = data.cell.raw;
            }

            // remove image name from cell
            if (
              data.cell.raw &&
              data.row.section === 'body' &&
              data.column.index === columnIndexes['image']
            ) {
              data.cell.text = [''];
            }

            // align cell center
            if (
              data.column.index === columnIndexes['ilosc'] ||
              data.column.index === columnIndexes['netto'] ||
              data.column.index === columnIndexes['brutto'] ||
              data.column.index === columnIndexes['wartoscNetto'] ||
              data.column.index === columnIndexes['wartoscBrutto']
            ) {
              data.cell.styles.halign = 'center';
            }
          },
          didDrawCell: (data) => {
            // for image type column
            if (
              data.row.section === 'body' &&
              data.column.index === columnIndexes['image'] &&
              data.row.index >= 0
            ) {
              const imageKey = data.cell.raw as string;
              const imageInfo = imageMap.get(imageKey);

              if (imageInfo) {
                let imgWidth = this.ROW_HEIGHT - this.IMAGE_HORIZONTAL_PADDING; // max width
                let imgHeight = (imageInfo.height / imageInfo.width) * imgWidth;

                if (imgHeight > this.ROW_HEIGHT) {
                  imgHeight = this.ROW_HEIGHT;
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
            if (data.column.index === columnIndexes['link'] && data.cell.raw) {
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
              top: Math.floor(this.ROW_HEIGHT / 2),
              bottom: Math.floor(this.ROW_HEIGHT / 2),
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
          columnStyles: this.columnStyles,
        });

        // calculate footer
        const footerRow = this.visibleColumns.map(({ key }) => {
          if (key === 'ilosc') return totals.ilosc;

          const value = totals[key as keyof typeof totals];
          return value !== undefined && typeof value === 'number'
            ? `${value.toFixed(2)} PLN`
            : '';
        });
        const footer = [footerRow];

        // draw footer
        const finalY = (doc as any).lastAutoTable?.finalY || 20;

        autoTable(doc, {
          body: footer,
          margin: 0,
          startY: finalY,
          bodyStyles: {
            font: 'Roboto',
            fontStyle: 'bold',
            halign: 'center',
            fillColor: '#2f9880',
            textColor: '#fff',
          },
          theme: 'grid',
          columnStyles: this.columnStyles,
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
        `Copyright @${new Date().getFullYear()} Żurawicki Design`
      );
    }

    const finalAction: Array<'save' | 'open' | 'send'> = [
      // 'save',
      'open',
      // 'send',
    ];

    // execute final actions
    finalAction.forEach((action) => {
      switch (action) {
        case 'save':
          doc.save(`zestawienie-${set.id}-${getFormatedDate()}.pdf`);
          break;
        case 'open':
          const pdfUrl = doc.output('bloburl'); // Generuje URL do PDF
          window.open(pdfUrl, '_blank'); // Otwiera w nowej karcie
          break;
        case 'send':
          const pdfBlob = doc.output('blob');
          const formData = new FormData();
          formData.append('files', pdfBlob, `zestawienie-${set.id}.pdf`);

          this.filesService.savePdf(set.id, formData).subscribe({
            next: (response) => {
              this.notificationService.showNotification(
                'success',
                'Zestawienie w PDF zostało poprawnie wysłane na serwer'
              );
            },
            error: (error) => {
              this.notificationService.showNotification('error', error.message);
            },
          });
          break;
      }
    });
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
    doc.setTextColor(this.colors.accentDarker);

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
