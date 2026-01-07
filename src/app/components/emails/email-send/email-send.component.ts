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
import { NotificationService } from '../../../services/notification.service';
import { SoundService } from '../../../services/sound.service';
import { SoundType } from '../../../services/types/SoundType';
import { ISet } from '../../sets/types/ISet';
import { ISetting } from '../../settings/ISetting';
import { SettingsService } from '../../settings/settings.service';
import { ISupplier } from '../../suppliers/ISupplier';
import { createHTMLEmail } from '../createHTMLEmail';
import { EmailsService } from '../email.service';
import { EmailDetailsList } from '../EmailDetailsList';
import { EmailAudience } from '../types/EmailAudience.type';
import { ClientTemplate, SupplierTemplate } from '../types/EmailTemplates.type';
import { IEmailDetailsToDB } from '../types/IEmailDetailsToDB';

@Component({
  selector: 'app-email-send',
  imports: [FormsModule, TooltipModule, SelectModule],
  templateUrl: './email-send.component.html',
  styleUrl: './email-send.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailSendComponent implements OnInit, AfterViewInit, OnDestroy {
  private _supplier?: ISupplier;
  @Input() set!: ISet;
  @Input()
  set audienceMode(value: EmailAudience) {
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
  private _audienceMode!: EmailAudience;

  @ViewChild('iframeRef') iframeRef!: ElementRef<HTMLIFrameElement>;

  @Output() getEmailsList = new EventEmitter<any>();
  @Output() hideEmailDialog = new EventEmitter<any>();

  private messageInput$ = new Subject<string>();
  private subscription!: Subscription;
  private viewInitialized = false;

  senderEmail = '';
  rawHTML = '';
  title = '';
  emailMessage = '';

  newEmail: IEmailDetailsToDB = {
    to: '',
    subject: '',
    content: '',
    link: '',
  };

  audience!: EmailAudience;

  templates: (ClientTemplate | SupplierTemplate)[] = [];
  selectedTemplate!: ClientTemplate | SupplierTemplate;

  constructor(
    private settingsService: SettingsService,
    private emailsService: EmailsService,
    private soundService: SoundService,
    private notificationService: NotificationService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.settingsService.getByType('senderEmail').subscribe({
      next: (response: ISetting) => {
        if (response) {
          this.senderEmail = response.value;
          this.cd.markForCheck();
        }
      },
    });

    this.subscription = this.messageInput$
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.loadPreview();
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
      this.supplier ? this.supplier.hash : this.set.clientId.hash
    );
  }

  applyTemplate(template: ClientTemplate | SupplierTemplate) {
    if (template.name === 'welcome') {
      this.newEmail.subject = `${template.subject}: ${this.set.name} utworzona w dniu ${this.set.createdAt}`;
    } else {
      this.newEmail.subject = template.subject;
    }

    this.title = template.subject;

    if (template.name === 'supplierOrder') {
      this.emailMessage = template.message({
        client: {
          firstName: this.set.clientId.firstName,
          lastName: this.set.clientId.lastName,
          company: this.set.clientId.company,
        },
      });
    } else {
      this.emailMessage = template.message({});
    }

    if (this.viewInitialized) {
      this.loadPreview();
    }
  }

  ngAfterViewInit() {
    const iframe = this.iframeRef.nativeElement;

    iframe.srcdoc = `
      <html>
        <body style="margin:0;padding:0;font-family:Arial;">
          <div id="preview"></div>
        </body>
      </html>
    `;

    iframe.onload = () => {
      this.viewInitialized = true;
      this.loadPreview();
    };
  }

  loadPreview() {
    const formattedMessage = this.emailMessage.replace(/\n/g, '<br />');
    this.rawHTML = createHTMLEmail({
      title: this.title,
      message: formattedMessage,
      link: this.newEmail.link,
    });

    const iframe = this.iframeRef.nativeElement;
    const doc = iframe.contentDocument;

    if (!doc) return;

    const container = doc.getElementById('preview');
    if (container) {
      container.innerHTML = this.rawHTML;
    }
  }

  onMessageChange(value: string) {
    this.messageInput$.next(value);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  sendEmail() {
    this.newEmail.content = this.rawHTML;
    this.newEmail.setId = this.set.id;

    if (this.supplier) {
      this.newEmail.supplierId = this.supplier.id;
    } else {
      this.newEmail.clientId = this.set.clientId.id;
    }

    this.emailsService.sendEmail(this.newEmail).subscribe({
      next: (response) => {
        this.notificationService.showNotification(
          'success',
          `Email na adres ${response.accepted[0]} został wysłany poprawnie`
        );

        this.soundService.playSound(SoundType.emailSending);
        this.getEmailsList.emit();
        this.hideEmailDialog.emit();
      },
      error: (error) => {
        const sendigError = error?.error?.message
          ? `${error.error.message} : ${error.error?.error}`
          : 'Nie udało się wysłać emaila.';

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
