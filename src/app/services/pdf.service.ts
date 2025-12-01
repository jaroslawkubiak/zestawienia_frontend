import { ElementRef, Injectable, ViewChild } from '@angular/core';
import type { jsPDF } from 'jspdf';
import { environment } from '../../environments/environment';
import { FilesService } from '../components/files/files.service';
import { ColumnList } from '../components/sets/ColumnList';
import { PositionStatusList } from '../components/sets/PositionStatusList';
import { IColumnList } from '../components/sets/types/IColumnList';
import { IPosition } from '../components/sets/types/IPosition';
import { IPositionStatus } from '../components/sets/types/IPositionStatus';
import { ISet } from '../components/sets/types/ISet';
import { calculateBrutto, calculateWartosc } from '../shared/helpers/calculate';
import { getCssVariable } from '../shared/helpers/getCssVariable';
import { getFormatedDate } from '../shared/helpers/getFormatedDate';
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
      pdfWidth: 15,
    },
    ...ColumnList,
  ];

  // get colors from css variables
  colors = {
    accent: getCssVariable('--accent-color-10'),
    accentLighter: getCssVariable('--accent-color-06'),
    accentDarker: getCssVariable('--accent-color-10'),
    black: getCssVariable('--black-color'),
    neutral: getCssVariable('--neutral-color-01'),
    neutralDarker: getCssVariable('--neutral-color-05'),
    white: getCssVariable('--white-color'),
  };

  ROW_HEIGHT = 60;
  IMAGE_HORIZONTAL_PADDING = 3;
  visibleColumns = this.columnList.filter(
    (col) => col.classHeader !== 'hidden'
  );
  headers: string[][] = [this.visibleColumns.map((col) => col.name)];
  columnStyles: ColumnStyles = {};
  positionStatus: IPositionStatus[] = PositionStatusList;
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

    // 🔥 Lazy loading jspdf i autotable
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

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

    const uniqueBookmarks = new Set(positions.map((pos) => pos.bookmarkId.id));
    const filteredBookmarks = set.bookmarks
      .filter((bookmark) => uniqueBookmarks.has(bookmark.id))
      .sort((a, b) => a.id - b.id);

    // draw summary
    const summaryTotals = filteredBookmarks.map((bookmark, i) => {
      const sum = positions
        .filter((p) => {
          if (p.bookmarkId.id !== bookmark.id) return false;

          if (!p.status) return true;

          if (typeof p.status === 'object' && 'summary' in p.status) {
            return p.status.summary === true;
          }

          return false;
        })
        .reduce((acc, p) => {
          const brutto = p.netto ? calculateBrutto(p.netto) : 0;
          const wartoscBrutto = p.ilosc ? calculateWartosc(p.ilosc, brutto) : 0;
          return acc + wartoscBrutto;
        }, 0);

      return {
        lp: i + 1,
        name: bookmark.name,
        brutto: sum,
      };
    });

    doc.setPage(1);

    // header summary
    this.drawBookmarkName(doc, 'Podsumowanie');
    const totalBrutto = summaryTotals.reduce((acc, row) => acc + row.brutto, 0);

    const summaryHead = [['LP', 'KATEGORIA', 'WARTOŚĆ [zł/brutto]']];
    const summaryBody = [
      ...summaryTotals.map((row) => [
        row.lp,
        row.name,
        formatPLN(row.brutto ?? 0),
      ]),
      ['', 'WARTOŚĆ CAŁKOWITA (brutto)', formatPLN(totalBrutto)],
    ];

    // tabela podsumowania
    autoTable(doc, {
      head: summaryHead,
      body: summaryBody,
      startY: 20,
      theme: 'grid',
      headStyles: {
        font: 'Roboto',
        fontStyle: 'bold',
        fillColor: this.colors.accentDarker,
        textColor: this.colors.white,
        halign: 'center',
        cellPadding: {
          top: Math.floor(10),
          bottom: Math.floor(10),
          right: 3,
          left: 3,
        },
      },
      bodyStyles: {
        font: 'Roboto',
        fontStyle: 'normal',
        fillColor: this.colors.white,
        textColor: this.colors.black,
        halign: 'center',
        cellPadding: {
          top: Math.floor(10),
          bottom: Math.floor(10),
          right: 3,
          left: 3,
        },
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 150 },
        2: { cellWidth: 100 },
      },

      didParseCell: (data) => {
        data.cell.styles.fontSize = 20;
        const isLastRow = data.row.index === summaryBody.length - 1;

        if (isLastRow && data.section === 'body') {
          data.cell.styles.fillColor = this.colors.accentDarker;
          data.cell.styles.textColor = this.colors.white;
          data.cell.styles.fontStyle = 'bold';
        }

        if (data.column.index === 0) {
          data.cell.styles.fillColor = this.colors.accentDarker;
          data.cell.styles.textColor = this.colors.white;
          data.cell.styles.fontStyle = 'bold';
        }

        if (data.column.index === 1 || data.column.index === 2) {
          data.cell.styles.halign = 'left';
        }
      },
    });

    doc.addPage();
    // end summary

    // main loop for every bookmark in set
    for (const [index, bookmark] of filteredBookmarks.entries()) {
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

          const imageName = removeMiniSuffix(row.image);

          const imageUrl = `${environment.FILES_URL}sets/${set.id}/positions/${row.id}/${imageName}`;
          try {
            const base64Image = await this.getBase64Image(imageUrl);
            const { width, height } = await this.getImageSize(
              base64Image as string
            );
            imageMap.set(row.id + '/' + imageName, {
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

              const imageName = row.image && removeMiniSuffix(row.image);

              // special case for couple columns like image and supplier
              switch (key) {
                case 'image':
                  return `${row.id}/${imageName}`;
                case 'lp':
                  return i + 1;
                case 'supplierId':
                  return row.supplierId?.company || '';
                case 'status':
                  return row.status?.label || '';
                case 'netto':
                  return formatPLN(netto);
                case 'brutto':
                  return formatPLN(brutto);
                case 'wartoscNetto':
                  return formatPLN(wartoscNetto);
                case 'wartoscBrutto':
                  return formatPLN(wartoscBrutto);
                default:
                  return row[key];
              }
            });
          };

          return formatRow(row);
        })
      );

      this.drawBookmarkName(doc, bookmark.name);

      // main table
      autoTable(doc, {
        head: this.headers,
        body: data,
        margin: 0,
        startY: 20,
        tableWidth: 'wrap',
        didParseCell: (data) => {
          // change row background according to status cell
          const statusColumnIndex = columnIndexes['status'];
          const rowArray = data.row.raw as any[];
          const status = rowArray[statusColumnIndex];
          if (status) {
            const statusObj = this.positionStatus.find(
              (s) => s.label === status
            );

            if (statusObj) {
              const kolor = getCssVariable(statusObj.color);
              data.cell.styles.fillColor = blendHexWithBackground(kolor);
            }
          }

          // change style for column LP
          if (data.column.index === columnIndexes['lp']) {
            data.cell.styles.fillColor = this.colors.accentDarker;
            data.cell.styles.textColor = this.colors.white;
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
            data.cell.styles.textColor = this.colors.accentDarker;
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

          // align cell to center
          const centeredColumns = [
            'lp',
            'ilosc',
            'netto',
            'brutto',
            'wartoscNetto',
            'wartoscBrutto',
          ];

          if (
            centeredColumns.includes(
              this.visibleColumns[data.column.index]?.key
            )
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
          valign: 'middle',
          fillColor: this.colors.accentDarker,
          textColor: this.colors.white,
          minCellHeight: 15,
        },
        bodyStyles: {
          font: 'Roboto',
          fontStyle: 'normal',
          fillColor: this.colors.white,
          textColor: this.colors.black,
          cellPadding: {
            top: Math.floor(this.ROW_HEIGHT / 2),
            bottom: Math.floor(this.ROW_HEIGHT / 2),
            right: 3,
            left: 3,
          },
        },
        theme: 'grid',
        columnStyles: this.columnStyles,
      });

      // calculate footer
      const footerRow = this.visibleColumns.map(({ key }) => {
        if (key === 'ilosc') return totals.ilosc;

        const value = totals[key as keyof typeof totals];
        return value !== undefined && typeof value === 'number'
          ? formatPLN(value)
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
          fillColor: this.colors.accentDarker,
          textColor: this.colors.white,
          halign: 'center',
          valign: 'middle',
          minCellHeight: 15,
        },
        theme: 'grid',
        columnStyles: this.columnStyles,
      });

      if (index !== uniqueBookmarks.size - 1) {
        doc.addPage();
      }
    }

    // draw header and footer for every page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      this.drawRectLeft(
        doc,
        0,
        14,
        14,
        this.colors.white,
        `Zestawienie : ${set.name}`
      );
      this.drawRectRight(
        doc,
        0,
        14,
        14,
        this.colors.white,
        set.clientId.firstName
      );
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

    const finalAction: Array<'saveToPC' | 'openInNewCard' | 'sendToFtp'> = [
      // 'saveToPC',
      'openInNewCard',
      // 'sendToFtp',
    ];

    // execute final actions
    finalAction.forEach((action) => {
      switch (action) {
        case 'saveToPC':
          doc.save(`zestawienie-${set.id}-${getFormatedDate()}.pdf`);
          break;
        case 'openInNewCard':
          const pdfUrl = doc.output('bloburl');
          window.open(pdfUrl, '_blank');
          break;
        case 'sendToFtp':
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

// blend alpha channel with white background - jsPDF doesn't support alpha channel
function blendHexWithBackground(
  hexWithAlpha: string,
  background: [number, number, number] = [255, 255, 255]
): [number, number, number] {
  const hex = hexWithAlpha.replace('#', '');
  const hasAlpha = hex.length === 8;

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const a = hasAlpha ? parseInt(hex.substring(6, 8), 16) / 255 : 1;

  const blend = (channel: number, bg: number) =>
    Math.round(channel * a + bg * (1 - a));

  return [
    blend(r, background[0]),
    blend(g, background[1]),
    blend(b, background[2]),
  ];
}

function removeMiniSuffix(filename: string): string {
  return filename.replace(/_mini(?=\.[^.]+$)/, '');
}

function formatPLN(value: number) {
  return (
    value.toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' PLN'
  );
}
