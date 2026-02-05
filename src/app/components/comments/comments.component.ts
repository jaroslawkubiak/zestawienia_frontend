import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Textarea } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { EmojiConvertPipe } from '../../pipe/emoji-convert.pipe';
import { ConfirmationModalService } from '../../services/confirmation.service';
import { NotificationService } from '../../services/notification.service';
import { SoundService } from '../../services/sound.service';
import { IConfirmationMessage } from '../../services/types/IConfirmationMessage';
import { SoundType } from '../../services/types/SoundType';
import { ISet } from '../sets/types/ISet';
import { CommentsService } from './comments.service';
import { IComment } from './types/IComment';
import { IEditedPartialComment } from './types/IEditedPartialComment';
import { INewPartialComment } from './types/INewPartialComment';
import { TAuthorType } from './types/authorType.type';

@Component({
  selector: 'app-comments',
  imports: [
    CommonModule,
    FormsModule,
    TooltipModule,
    Textarea,
    EmojiConvertPipe,
  ],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css',
})
export class CommentsComponent implements AfterViewInit, OnChanges {
  @Input() set!: ISet;
  @Input() positionId!: number;
  @Input() comments: IComment[] = [];
  @Input() commentsDialog = false;
  @Input() commentWatcher!: TAuthorType;
  newMessage: string = '';
  editedCommentId: number | null = null;
  clientsAvatar = `assets/images/avatars/default.png`;
  @ViewChild('chatContainer') private chatContainerRef!: ElementRef;

  constructor(
    private commentsService: CommentsService,
    private notificationService: NotificationService,
    private confirmationModalService: ConfirmationModalService,
    private soundService: SoundService,
    private cd: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    if (this.commentsDialog) {
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const avatars = {
      light: ['chicken', 'cat', 'dog', 'shark', 'tiger', 'unicorn'],
      dark: ['cat', 'dog', 'monkey', 'boar', 'unicorn'],
    } as const;

    const avatarsColor: keyof typeof avatars = 'light';

    const images = avatars[avatarsColor];
    const randomAvatar = images[Math.floor(Math.random() * images.length)];

    this.clientsAvatar = `assets/images/avatars/clients/${avatarsColor}/${randomAvatar}.png`;

    if (
      changes['commentsDialog'] &&
      changes['commentsDialog'].currentValue === true
    ) {
      setTimeout(() => this.scrollToBottom(), 0);

      this.markAllCommentsAsSeen(this.positionId);
    }
  }

  private markAllCommentsAsSeen(positionId: number) {
    this.commentsService
      .markAllCommentsAsSeen(positionId, this.comments, this.commentWatcher)
      .subscribe();
  }

  sendComment(textarea: HTMLTextAreaElement) {
    if (!this.newMessage.trim() || this.set.id === null) return;
    // add new comment
    if (!this.editedCommentId) {
      const newComment: INewPartialComment = {
        comment: this.newMessage,
        authorType: this.commentWatcher,
        setId: this.set.id,
        positionId: this.positionId,
        set: this.set,
      };

      this.commentsService.addComment(newComment).subscribe({
        next: (response) => {
          this.comments = [...this.comments, response];
          this.newMessage = '';
          this.resetTextareaHeight(textarea);

          this.soundService.playSound(SoundType.messageSending);
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);

          this.cd.detectChanges();
        },
        error: (error) => {
          console.error(error);
        },
      });
    } else {
      // edit comment
      const editedComment: IEditedPartialComment = {
        commentId: this.editedCommentId,
        comment: this.newMessage,
        authorType: this.commentWatcher,
        set: this.set,
      };

      this.commentsService.editComment(editedComment).subscribe({
        next: (response) => {
          const commentIndex = this.comments.findIndex(
            (item) => item.id === this.editedCommentId,
          );

          if (commentIndex !== -1) {
            this.comments[commentIndex] = response;
          }

          this.newMessage = '';
          this.editedCommentId = null;
          this.soundService.playSound(SoundType.messageSending);
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);

          this.cd.detectChanges();
        },
        error: (error) => {
          console.error(error);
        },
      });
    }
  }

  markCommentToEdit(id: number) {
    this.editedCommentId = id;
    this.newMessage =
      this.comments.find((item) => item.id === id)?.comment || '';
  }

  deleteComment(id: number) {
    const accept = () => {
      this.commentsService.deleteComment(id).subscribe({
        next: () => {
          this.comments = this.comments.filter((item) => item.id !== id);
          this.soundService.playSound(SoundType.trash);
          this.cd.detectChanges();
        },
        error: (error) => {
          console.error(error);
        },
      });
    };

    const confirmMessage: IConfirmationMessage = {
      message: 'Czy na pewno usunąć komentarz?',
      header: 'Potwierdź usunięcie komentarza',
      accept,
    };

    this.confirmationModalService.showConfirmation(confirmMessage);
  }

  toggleCommentAsNeedAttention(id: number) {
    this.commentsService.toggleCommentAsNeedAttention(id).subscribe({
      next: (response: IComment) => {
        const updatedComment = response;
        this.notificationService.showNotification(
          'info',
          `Komentarz został oznaczony jako ${
            updatedComment.needsAttention ? 'wymaga uwagi' : 'nie wymaga uwagi'
          }`,
        );
        this.comments = this.comments.map((item) =>
          item.id === updatedComment.id
            ? { ...item, needsAttention: updatedComment.needsAttention }
            : item,
        );

        this.cd.detectChanges();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  markAllCommentsAsNeedsAttention(state: boolean) {
    this.commentsService
      .markAllCommentsAsNeedsAttention(
        this.positionId,
        state,
        this.commentWatcher,
      )
      .subscribe({
        next: (updatedComments) => {
          this.notificationService.showNotification(
            'info',
            `Wszystkie komentarze zostały oznaczone jako ${
              state ? 'wymagające uwagi' : 'nie wymagające uwagi'
            }`,
          );
          this.comments = updatedComments;

          this.cd.detectChanges();
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  isCommentNew(comment: IComment): boolean {
    return !comment.seenAt && comment.authorType !== this.commentWatcher;
  }

  isIncoming(comment: IComment): boolean {
    return comment.authorType !== this.commentWatcher;
  }

  isNeedsAttention(comment: IComment): boolean {
    return comment.needsAttention && comment.authorType !== this.commentWatcher;
  }

  needsAttentionTooltip(comment: IComment): string {
    return !comment.needsAttention
      ? 'Oznacz jako wymaga uwagi'
      : 'Oznacz jako nie wymaga uwagi';
  }

  getCommentAvatar(comment: IComment): string {
    if (comment.authorType === 'user') {
      return `assets/images/avatars/users/${comment.authorId}.png`;
    }

    return this.clientsAvatar;
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/avatars/default.png';
  }

  adjustTextareaHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';
  }

  resetTextareaHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
  }

  parseTextWithLinks(text: string): string {
    const HTMLlinkAttribute =
      'target="_blank" class="message-link" rel="noopener noreferrer"';

    const httpLinkRegex = /^https?:\/\/[^\s]+$/i;
    const domainLinkRegex = /^(www\.)?[\w-]+\.[a-z]{2,}(\/[^\s]*)?$/i;
    const trailingPunctuationRegex = /[.,!?;:]+$/;

    return text.replace(/(\S+)/g, (word) => {
      const trailing = word.match(trailingPunctuationRegex)?.[0] ?? '';
      const cleanWord = word.replace(trailingPunctuationRegex, '');

      if (httpLinkRegex.test(cleanWord)) {
        return `<a href="${cleanWord}" ${HTMLlinkAttribute}>${cleanWord}</a>${trailing}`;
      }

      if (domainLinkRegex.test(cleanWord)) {
        return `<a href="http://${cleanWord}" ${HTMLlinkAttribute}>${cleanWord}</a>${trailing}`;
      }

      return word;
    });
  }

  private scrollToBottom() {
    try {
      const element = this.chatContainerRef.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  onKeydown(event: Event, textarea: HTMLTextAreaElement) {
    if (!(event instanceof KeyboardEvent)) return;

    if (event.key !== 'Enter' || event.shiftKey) return;

    event.preventDefault();
    this.sendComment(textarea);
  }
}
