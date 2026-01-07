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
import { NotificationService } from '../../../services/notification.service';
import { SoundService } from '../../../services/sound.service';
import { SoundType } from '../../../services/types/SoundType';
import { ISet } from '../../sets/types/ISet';
import { ISetting } from '../../settings/ISetting';
import { SettingsService } from '../../settings/settings.service';
import { ISupplier } from '../../suppliers/ISupplier';
import { createHTMLEmail } from '../createHTMLEmail';
import { EmailsService } from '../email.service';
import { HTMLDetails } from '../htmlDetails';
import { IEmailDetailsToDB } from '../types/IEmailDetailsToDB';

@Component({
  selector: 'app-email-send',
  imports: [CommonModule, FormsModule, TooltipModule, SelectModule],
  templateUrl: './email-send.component.html',
  styleUrl: './email-send.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailSendComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() set!: ISet;
  @Input() supplier: ISupplier | undefined;
  @ViewChild('iframeRef') iframeRef!: ElementRef<HTMLIFrameElement>;

  @Output() getEmailsList = new EventEmitter<any>();
  @Output() hideEmailDialog = new EventEmitter<any>();

  private messageInput$ = new Subject<string>();
  private subscription!: Subscription;

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

    // SUPPLIER EMAIL
    if (this.supplier) {
      // const template = HTMLDetails.supplier.supplierOffer;
      // this.emailMessage = template.message();

      // druga wersja
      const template = HTMLDetails.supplier.supplierOrder;
      this.emailMessage = template.message({
        client: {
          firstName: this.set.clientId.firstName,
          lastName: this.set.clientId.lastName,
          company: this.set.clientId.company,
        },
      });

      this.title = template.subject;
      this.newEmail.subject = template.subject;

      this.newEmail.to = this.supplier.email;
      this.newEmail.link = this.emailsService.createExternalLink(
        'supplier',
        this.set.hash,
        this.supplier.hash
      );
    } else {
      // CLIENT EMAIL
      const template = HTMLDetails.client.welcomeEmail;

      this.emailMessage = template.message();
      this.title = template.subject;
      this.newEmail.subject = `${template.subject}: ${this.set.name} utworzona w dniu ${this.set.createdAt}`;

      this.newEmail.to = this.set.clientId.email;
      this.newEmail.link = this.emailsService.createExternalLink(
        'client',
        this.set.hash,
        this.set.clientId.hash
      );
    }

    this.subscription = this.messageInput$
      .pipe(debounceTime(700))
      .subscribe(() => {
        this.loadPreview();
      });
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
}
