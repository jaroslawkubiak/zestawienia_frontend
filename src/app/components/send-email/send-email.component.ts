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
import { NotificationService } from '../../services/notification.service';
import { SoundService } from '../../services/sound.service';
import { SoundType } from '../../services/types/SoundType';
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
  imports: [FormsModule, TooltipModule, SelectModule, CommonModule],
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendEmailComponent implements OnInit, AfterViewInit {
  TOTAL_IFRAME = 2;
  allTemplates: IEmailTemplateList[] = [];
  templates: IEmailTemplateList[] = [];
  selectedTemplate!: IEmailTemplateList;
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
  @Output() getEmailsList = new EventEmitter<any>();
  @Output() hideEmailDialog = new EventEmitter<any>();

  private viewInitialized = false;

  senderEmail = '';
  receiverEmail = '';
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

    this.receiverEmail = this.supplier
      ? this.supplier.email
      : this.set.clientId.email;
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
    iframeHeader.srcdoc = `
    <html><body style="margin:0;padding:0;font-family:Arial;">
      <div id="previewHeader"></div>
    </body></html>`;
    iframeHeader.onload = checkAndLoadPreview;

    const iframeFooter = this.iframeRefFooter.nativeElement;
    iframeFooter.srcdoc = `
    <html><body style="margin:0;padding:0;font-family:Arial;">
      <div id="previewFooter"></div>
    </body></html>`;
    iframeFooter.onload = checkAndLoadPreview;
  }

  loadPreview() {
    if (!this.selectedTemplate) return;

    const emailPreviewDetails: IEmailPreviewDetails = {
      type: this.selectedTemplate.templateName as EmailTemplateName,
      setId: this.set.id,
      audienceType: this.audience,
      client: this.set.clientId,
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
        this.emailSubject = response.emailSubject;
        this.linkToSet = response.linkToSet;

        this.cd.markForCheck();
      });
  }

  onMessageChange(value: string) {
    this.emailMessage = value;
  }

  get isSendingDisabled(): boolean {
    return (
      (this.audience === 'client' && !this.sendingEmailsToClient) ||
      (this.audience === 'supplier' && !this.sendingEmailsToSuppliers)
    );
  }

  get tooltipText(): string {
    return this.isSendingDisabled ? 'Wysyłanie wyłączone' : 'Wyślij e-mail';
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
    if (this.isSendingDisabled) {
      this.notificationService.showNotification('warn', this.disabledMessage);

      this.hideEmailDialog.emit();
      return;
    }

    const newEmail: IEmailDetailsLog = {
      to: this.receiverEmail,
      subject: this.emailSubject,
      content: this.getFullEmailHtml(),
      setId: this.set.id,
      supplierId: this.supplier?.id,
      clientId: this.supplier ? undefined : this.set.clientId.id,
      link: this.linkToSet,
    };

    this.emailsService.sendEmail(newEmail).subscribe({
      next: (response) => {
        this.notificationService.showNotification(
          'success',
          `E-mail na adres ${response?.accepted[0]} został wysłany poprawnie`,
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
    const bodyHtml = (this.emailMessage || '').replace(/\n/g, '<br/>');

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
}
