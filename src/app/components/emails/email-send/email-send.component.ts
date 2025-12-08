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
import { TooltipModule } from 'primeng/tooltip';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import { SoundService } from '../../../services/sound.service';
import { SoundType } from '../../../services/types/SoundType';
import { ISet } from '../../sets/types/ISet';
import { ISetting } from '../../settings/ISetting';
import { SettingsService } from '../../settings/settings.service';
import { ISupplier } from '../../suppliers/ISupplier';
import { EmailsService } from '../email.service';
import { createHTMLHeader, HTMLClient, HTMLSupplier } from '../email.template';
import { IEmailDetails } from '../types/IEmailDetails';

@Component({
  selector: 'app-email-send',
  imports: [CommonModule, FormsModule, TooltipModule],
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

  fromEmail = '';
  rawHTML = '';
  title = '';
  emailMessage = '';

  private messageInput$ = new Subject<string>();
  private subscription!: Subscription;

  newEmail: IEmailDetails = {
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
          this.fromEmail = response.value;
          this.cd.markForCheck();
        }
      },
    });

    if (this.supplier) {
      this.newEmail.to = this.supplier.email;
      this.newEmail.subject = `Zamówienie do inwestycji ${this.set.name}`;
      this.newEmail.link = this.emailsService.createExternalLink(
        'supplier',
        this.set.hash,
        this.supplier.hash
      );

      this.emailMessage = HTMLSupplier.message;
      this.title = HTMLSupplier.title;
    } else {
      this.newEmail.to = this.set.clientId.email;
      this.newEmail.subject = `Inwestycja ${this.set.name} utworzona w dniu ${this.set.createdAt}`;
      this.newEmail.link = this.emailsService.createExternalLink(
        'supplier',
        this.set.hash,
        this.set.clientId.hash
      );

      this.emailMessage = HTMLClient.message;
      this.title = HTMLClient.title;
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

    this.rawHTML = createHTMLHeader({
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
