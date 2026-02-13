import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { SoundService } from '../../services/sound.service';
import { SoundType } from '../../services/types/SoundType';
import { EmailsService } from '../sended-emails/email.service';
import { EmailDetailsList } from '../sended-emails/EmailDetailsList';
import { TEmailAudience } from '../sended-emails/types/EmailAudience.type';
import {
  ClientTemplate,
  SupplierTemplate,
} from '../sended-emails/types/EmailTemplates.type';
import { IEmailDetailsLog } from '../sended-emails/types/IEmailDetailsLog';
import { ISet } from '../sets/types/ISet';
import { SettingsService } from '../settings/settings.service';
import { DbSettings } from '../settings/types/IDbSettings';
import { ISupplier } from '../suppliers/types/ISupplier';

@Component({
  selector: 'app-send-email',
  imports: [FormsModule, TooltipModule, SelectModule, CommonModule],
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendEmailComponent implements OnInit, AfterViewInit, OnDestroy {
  private _supplier?: ISupplier;
  @Input() set!: ISet;
  @Input()
  set audienceMode(value: TEmailAudience) {
    this._audienceMode = value;
    this.onAudienceChange();
  }
  @Input()
  set dialogOpenId(_: number) {
    this.resetState();
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

  @ViewChild('iframeRef') iframeRef!: ElementRef<HTMLIFrameElement>;

  @Output() getEmailsList = new EventEmitter<any>();
  @Output() hideEmailDialog = new EventEmitter<any>();

  private messageInput$ = new Subject<string>();
  private subscription!: Subscription;
  private viewInitialized = false;
  private baseLayoutHTML = '';

  senderEmail = '';
  HTMLheader = '';
  emailMessage = '';

  newEmail: IEmailDetailsLog = {
    to: '',
    subject: '',
    content: '',
    link: '',
  };

  audience!: TEmailAudience;

  templates: (ClientTemplate | SupplierTemplate)[] = [];
  selectedTemplate!: ClientTemplate | SupplierTemplate;

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

    this.subscription = this.messageInput$
      .pipe(debounceTime(50))
      .subscribe(() => {
        this.updateContentOnly();
      });
  }

  onAudienceChange() {
    this.audience = this._audienceMode;

    this.templates =
      this.audience === 'supplier'
        ? Object.values(EmailDetailsList.supplier)
        : Object.values(EmailDetailsList.client);

    this.selectedTemplate = this.templates[0];
    this.applyTemplate(this.selectedTemplate);

    this.newEmail.to = this.supplier
      ? this.supplier.email
      : this.set.clientId.email;

    this.newEmail.link = this.emailsService.createExternalLink(
      this.audience,
      this.set.hash,
      this.supplier ? this.supplier.hash : this.set.clientId.hash,
    );
  }

  applyTemplate(template: ClientTemplate | SupplierTemplate) {
    this.newEmail.subject =
      template.name === 'clientWelcome'
        ? `${template.subject}: ${this.set.name} utworzona w dniu ${this.set.createdAt}`
        : template.subject;

    this.HTMLheader = template.subject;

    this.emailMessage =
      template.name === 'supplierOrder'
        ? template.message({ client: this.set.clientId })
        : template.message({});

    if (this.viewInitialized) {
      this.loadPreview();
    }
  }

  ngAfterViewInit() {
    const iframe = this.iframeRef.nativeElement;
    iframe.srcdoc = `
    <html><body style="margin:0;padding:0;font-family:Arial;">
      <div id="preview"></div>
    </body></html>
  `;
    iframe.onload = () => {
      this.viewInitialized = true;
      this.loadPreview();
    };
  }

  loadPreview() {
    if (!this.selectedTemplate) return;

    const formattedMessage = this.emailMessage.replace(/\n/g, '<br />');

    this.emailsService
      .previewEmail(this.selectedTemplate.name, {
        HTMLheader: this.HTMLheader,
        HTMLContent: formattedMessage,
        linkToSet: this.newEmail.link,
      })
      .subscribe((res) => {
        this.baseLayoutHTML = res.html;

        const iframe = this.iframeRef.nativeElement;
        const doc = iframe.contentDocument;

        if (!doc) return;

        const container = doc.getElementById('preview');
        if (container) {
          container.innerHTML = this.baseLayoutHTML;
        }
      });
  }

  private updateContentOnly() {
    const iframe = this.iframeRef.nativeElement;
    const doc = iframe.contentDocument;
    if (!doc) return;

    const dynamic = doc.getElementById('dynamic-content');
    if (!dynamic) return;

    dynamic.innerHTML = this.emailMessage.replace(/\n/g, '<br />');
  }

  onMessageChange(value: string) {
    this.messageInput$.next(value);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
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

    const iframe = this.iframeRef.nativeElement;
    const doc = iframe.contentDocument;

    if (doc) {
      this.newEmail.content = doc.documentElement.outerHTML;
    }

    this.newEmail.setId = this.set.id;

    this.newEmail.supplierId = this.supplier?.id;
    this.newEmail.clientId = this.supplier ? undefined : this.set.clientId.id;

    this.emailsService.sendEmail(this.newEmail).subscribe({
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

  private resetState() {
    this.onAudienceChange();

    if (this.viewInitialized) {
      this.loadPreview();
    }
  }
}
