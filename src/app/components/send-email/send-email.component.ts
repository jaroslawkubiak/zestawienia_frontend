import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { SoundService } from '../../services/sound.service';
import { SoundType } from '../../services/types/SoundType';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { EmailsService } from '../sended-emails/email.service';
import { TEmailAudience } from '../sended-emails/types/EmailAudience.type';
import { IEmailDetailsLog } from '../sended-emails/types/IEmailDetailsLog';
import { ISet } from '../sets/types/ISet';
import { SettingsService } from '../settings/settings.service';
import { DbSettings } from '../settings/types/IDbSettings';
import { ISupplier } from '../suppliers/types/ISupplier';
import { EmailTemplateName } from './types/EmailTemplateName.type';
import { IEmailPreviewDetails } from './types/IEmailPreviewDetails';
import { IEmailTemplateList } from './types/IEmailTemplateList';

@Component({
  selector: 'app-send-email',
  imports: [
    FormsModule,
    TooltipModule,
    SelectModule,
    CommonModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendEmailComponent implements OnInit, AfterViewInit {
  TOTAL_IFRAME = 2;
  allTemplates: IEmailTemplateList[] = [];
  templates: IEmailTemplateList[] = [];
  selectedTemplate!: IEmailTemplateList;
  editEmailBody = false;
  private _supplier?: ISupplier;
  @Input() set!: ISet;
  @Input()
  set audienceMode(value: TEmailAudience) {
    this._audienceMode = value;
    this.onAudienceChange();
  }

  @Input()
  set supplier(value: ISupplier | undefined) {
    this._supplier = value;
    this.onAudienceChange();
  }

  get supplier(): ISupplier | undefined {
    return this._supplier;
  }
  private _audienceMode!: TEmailAudience;

  @ViewChild('iframeRefHeader') iframeRefHeader!: ElementRef<HTMLIFrameElement>;
  @ViewChild('iframeRefFooter') iframeRefFooter!: ElementRef<HTMLIFrameElement>;
  @ViewChild('iframeRefBody') iframeRefBody!: ElementRef<HTMLIFrameElement>;
  @Output() getEmailsList = new EventEmitter<any>();
  @Output() hideEmailDialog = new EventEmitter<any>();

  private viewInitialized = false;

  senderEmail = '';
  receiverEmail = '';
  receiverSecondEmail = '';
  emailSubject = '';
  emailMessage = '';
  linkToSet = '';
  audience!: TEmailAudience;
  sendingEmailsToClient!: boolean;
  sendingEmailsToSuppliers!: boolean;
  settingsNames = [
    'sendingEmailsToClient',
    'sendingEmailsToSupplier',
    'senderEmail',
  ];
  sendingInProgress = false;
  constructor(
    private settingsService: SettingsService,
    private emailsService: EmailsService,
    private soundService: SoundService,
    private notificationService: NotificationService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.settingsService.getSettingByNames(this.settingsNames).subscribe({
      next: (settings: DbSettings[]) => {
        settings.forEach((setting) => {
          switch (setting.name) {
            case 'sendingEmailsToClient':
              this.sendingEmailsToClient = setting.value === 'true';
              break;
            case 'sendingEmailsToSupplier':
              this.sendingEmailsToSuppliers = setting.value === 'true';
              break;
            case 'senderEmail':
              this.senderEmail = setting.value;
              break;
          }
        });

        this.cd.markForCheck();
      },
    });

    this.emailsService.getTemplates().subscribe((response) => {
      this.allTemplates = response;
      this.onAudienceChange();
    });
  }

  onAudienceChange() {
    this.audience = this._audienceMode;

    this.templates = this.allTemplates.filter(
      (t) => t.audience === this.audience,
    );

    this.selectedTemplate = this.templates[0];

    this.applyTemplate(this.selectedTemplate);

    if (this.supplier) {
      this.receiverEmail = this.supplier.email;
    } else {
      this.receiverEmail = this.set.clientId.email;
      this.receiverSecondEmail = this.set.clientId.secondEmail;
    }
  }

  get fullReceiverEmail(): string {
    return [this.receiverEmail, this.receiverSecondEmail]
      .filter(Boolean)
      .join('; ');
  }

  applyTemplate(template: IEmailTemplateList) {
    this.selectedTemplate = template;

    if (this.viewInitialized) {
      this.loadPreview();
    }
  }

  ngAfterViewInit() {
    let loadedIframes = 0;

    const checkAndLoadPreview = () => {
      loadedIframes++;

      if (loadedIframes === this.TOTAL_IFRAME) {
        this.viewInitialized = true;
        this.loadPreview();
      }
    };

    const iframeHeader = this.iframeRefHeader.nativeElement;
    const iframeBody = this.iframeRefBody.nativeElement;
    const iframeFooter = this.iframeRefFooter.nativeElement;

    this.initIframe(iframeHeader, 'previewHeader', checkAndLoadPreview);
    this.initIframe(iframeBody, 'previewBody', checkAndLoadPreview);
    this.initIframe(iframeFooter, 'previewFooter', checkAndLoadPreview);
  }

  loadPreview() {
    if (!this.selectedTemplate) return;

    const emailPreviewDetails: IEmailPreviewDetails = {
      type: this.selectedTemplate.templateName as EmailTemplateName,
      setId: this.set.id,
      audienceType: this.audience,
      client: this.set.clientId,
      supplier: this._supplier,
    };

    this.emailsService
      .getEmailPreview(emailPreviewDetails)
      .subscribe((response) => {
        const iframeHeader = this.iframeRefHeader.nativeElement;
        const docHeader = iframeHeader.contentDocument;

        if (!docHeader) return;

        const containerHeader = docHeader.getElementById('previewHeader');
        if (containerHeader) {
          containerHeader.innerHTML = response.header;
        }

        const iframeFooter = this.iframeRefFooter.nativeElement;
        const docFooter = iframeFooter.contentDocument;

        if (!docFooter) return;

        const containerFooter = docFooter.getElementById('previewFooter');
        if (containerFooter) {
          containerFooter.innerHTML = response.footer;
        }

        this.emailMessage = response.content;
        this.renderBody();

        this.emailSubject = response.emailSubject;
        this.linkToSet = response.linkToSet;

        this.cd.markForCheck();
      });
  }

  renderBody() {
    const iframeBody = this.iframeRefBody.nativeElement;
    const docBody = iframeBody.contentDocument;

    if (!docBody) return;

    const container = docBody.getElementById('previewBody');

    if (container) {
      container.innerHTML = this.emailMessage.replace(/\n/g, '<br/>');

      this.adjustIframeHeight(iframeBody);
    }
  }

  onMessageChange(value: string) {
    this.emailMessage = value;

    if (!this.editEmailBody) {
      this.renderBody();
    }
  }

  get isSendingDisabled(): boolean {
    return (
      (this.audience === 'client' && !this.sendingEmailsToClient) ||
      (this.audience === 'supplier' && !this.sendingEmailsToSuppliers)
    );
  }

  get tooltipText(): string {
    return this.isSendingDisabled
      ? 'Wysyłanie wyłączone'
      : this.sendingInProgress
        ? 'Wysyłanie'
        : 'Wyślij e-mail';
  }

  get disabledMessage(): string {
    switch (this.audience) {
      case 'client':
        return 'Wysyłanie emaili do klientów jest wyłączone';
      case 'supplier':
        return 'Wysyłanie emaili do dostawców jest wyłączone';
      default:
        return 'Wysyłanie jest wyłączone';
    }
  }

  sendEmail() {
    this.sendingInProgress = true;
    if (this.isSendingDisabled) {
      this.notificationService.showNotification('warn', this.disabledMessage);

      this.hideEmailDialog.emit();
      return;
    }

    const newEmail: IEmailDetailsLog = {
      to: this.receiverEmail,
      secondEmail: this.receiverSecondEmail,
      subject: this.emailSubject,
      content: this.getFullEmailHtml(),
      setId: this.set.id,
      supplierId: this.supplier?.id,
      clientId: this.supplier ? undefined : this.set.clientId.id,
      link: this.linkToSet,
    };

    this.emailsService
      .sendEmail(newEmail)
      .pipe(
        finalize(() => {
          this.sendingInProgress = false;
        }),
      )
      .subscribe({
        next: (response) => {
          let confirmationMessage = `Poprawnie wysłano e-mail na adres \n ${response?.accepted[0]}`;

          if (response?.accepted.length > 1) {
            const emailReceiver = response?.accepted.join('\n');
            confirmationMessage = `Poprawnie wysłano e-mail na adresy \n ${emailReceiver}`;
          }

          this.notificationService.showNotification(
            'success',
            confirmationMessage,
          );

          this.soundService.playSound(SoundType.emailSending);
          this.getEmailsList.emit();
          this.hideEmailDialog.emit();
        },
        error: (error) => {
          const sendigError = error?.error?.message
            ? `${error.error.message} : ${error.error?.error}`
            : 'Nie udało się wysłać e-maila.';

          this.notificationService.showNotification('error', sendigError);
        },
      });
  }

  private getFullEmailHtml(): string {
    const iframeHeader = this.iframeRefHeader.nativeElement;
    const docHeader = iframeHeader.contentDocument;

    const iframeFooter = this.iframeRefFooter.nativeElement;
    const docFooter = iframeFooter.contentDocument;

    const headerHtml =
      docHeader?.getElementById('previewHeader')?.innerHTML || '';

    const footerHtml =
      docFooter?.getElementById('previewFooter')?.innerHTML || '';
    const bodyHtml = (this.emailMessage || '').replace(/\n/g, '<br />');

    return `
    <table align='center' width='800px' border='0' style='margin:20px auto; max-width:800px; border-collapse: collapse;'>
      <tr>
        <td>
          ${headerHtml}
        </td>
      </tr>          
      <tr>
        <td style='font-size: 16px;'>
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td>
          ${footerHtml}
        </td>
      </tr>
    </table>
  `;
  }

  initIframe(
    iframe: HTMLIFrameElement,
    id: string,
    onLoadCallback?: () => void,
  ) {
    iframe.onload = () => {
      onLoadCallback?.();
    };

    iframe.srcdoc = `
    <html>
      <body style="margin:0;padding:0;font-family:Arial;">
        <div id="${id}"></div>
      </body>
    </html>
  `;
  }

  toggleEditEmailBody() {
    this.editEmailBody = !this.editEmailBody;

    if (!this.editEmailBody) {
      setTimeout(() => {
        const iframe = this.iframeRefBody?.nativeElement;

        if (!iframe) return;

        this.initIframe(iframe, 'previewBody', () => {
          this.renderBody();
        });
      });
    }
  }

  adjustIframeHeight(iframe: HTMLIFrameElement) {
    if (iframe.contentDocument) {
      const doc = iframe.contentDocument;
      const height = doc.body.scrollHeight;
      iframe.style.height = height + 'px';
    }
  }
}
