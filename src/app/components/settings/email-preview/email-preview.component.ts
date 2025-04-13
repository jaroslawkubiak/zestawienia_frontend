import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { EmailsService } from '../../emails/email.service';
import { createHTML, HTMLClient } from './email.template';

@Component({
  selector: 'app-email-preview',
  imports: [CommonModule],
  templateUrl: './email-preview.component.html',
  styleUrl: './email-preview.component.css',
})
export class EmailPreviewComponent {
  @ViewChild('iframeRef') iframeRef!: ElementRef<HTMLIFrameElement>;
  constructor(private emailsService: EmailsService) {}
  selected: string = '';
  clientLink = 'http://localhost:3005/1/qgmFfnXKiBWRkErt980u2YBSaHGMAN';
  supplierLink =
    'http://localhost:3005/1/qgmFfnXKiBWRkErt980u2YBSaHGMAN/DvGkpVWNWqeAXjYYFS3gd424Ii0HPv';

  loadPreview(type: 'client' | 'supplier') {
    this.selected = type;
    const rawHTML =
      type === 'client'
        ? createHTML({
            title: HTMLClient.title,
            message: HTMLClient.message,
            link: this.clientLink,
          })
        : createHTML({
            title: HTMLClient.title,
            message: HTMLClient.message,
            link: this.supplierLink,
          });

    const iframe = this.iframeRef.nativeElement;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (doc) {
      doc.open();
      doc.write(rawHTML);
      doc.close();
    }
  }
}
