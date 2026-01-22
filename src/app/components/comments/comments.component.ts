import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationModalService } from '../../services/confirmation.service';
import { NotificationService } from '../../services/notification.service';
import { SoundService } from '../../services/sound.service';
import { IConfirmationMessage } from '../../services/types/IConfirmationMessage';
import { SoundType } from '../../services/types/SoundType';
import { ISet } from '../sets/types/ISet';
import { CommentsService } from './comments.service';
import { IComment } from './types/IComment';
import { IEditedComment } from './types/IEditedComment';
import { IPositionWithComments } from './types/IPositionWithComments';

@Component({
  selector: 'app-comments',
  imports: [CommonModule, FormsModule, TooltipModule],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css',
})
export class CommentsComponent implements AfterViewInit, OnChanges {
  @Input() setId!: number | null;
  @Input() set!: ISet;
  @Input() positionId!: number;
  @Input() comments: IComment[] = [];
  @Input() commentsDialog = false;
  @Input() isUser: boolean = true;
  @Output() updateComments = new EventEmitter<IPositionWithComments>();
  newMessage: string = '';
  editedCommentId: number | null = null;
  @ViewChild('chatContainer') private chatContainerRef!: ElementRef;

  constructor(
    private commentsService: CommentsService,
    private notificationService: NotificationService,
    private confirmationModalService: ConfirmationModalService,
    private soundService: SoundService,
  ) {}

  ngAfterViewInit() {
    if (this.commentsDialog) {
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['commentsDialog'] && this.commentsDialog) {
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  private scrollToBottom() {
    try {
      const element = this.chatContainerRef.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  sendComment() {
    if (!this.newMessage.trim() || this.setId === null) return;
    // add new comment
    if (!this.editedCommentId) {
      this.commentsService
        .addComment(this.newMessage, this.setId, this.positionId, this.set)
        .subscribe({
          next: (response) => {
            this.comments.push(response);
            this.newMessage = '';
            this.soundService.playSound(SoundType.messageSending);
            setTimeout(() => {
              this.scrollToBottom();
            }, 100);

            if (!response.notificationSend) {
              this.notificationService.showNotification(
                'warn',
                `Powiadomienia o nowych komantarzach są wyłączone.`,
              );
            }

            this.onUpdateComments();
          },
          error: (error) => {
            console.error(error);
          },
        });
    } else {
      // edit comment
      const editedComment: IEditedComment = {
        commentId: this.editedCommentId,
        comment: this.newMessage,
        clientId: this.set?.clientId?.id,
        authorName: this.set?.clientId?.firstName,
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

          this.onUpdateComments();
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
        next: (response) => {
          this.comments = this.comments.filter((item) => item.id !== id);
          this.soundService.playSound(SoundType.trash);
          this.onUpdateComments();
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

  toggleCommentRead(id: number) {
    this.commentsService.toggleCommentRead(id).subscribe({
      next: (response: IComment) => {
        const updatedComment = response;
        this.notificationService.showNotification(
          'info',
          `Komentarz został oznaczony jako ${
            updatedComment.readByReceiver ? 'przeczytany' : 'nieprzeczytany'
          }`,
        );
        this.comments = this.comments.map((item) =>
          item.id === updatedComment.id
            ? { ...item, readByReceiver: updatedComment.readByReceiver }
            : item,
        );

        this.onUpdateComments();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  markAllComments(state: boolean, authorType: 'user' | 'client') {
    this.commentsService
      .markAllComments(this.positionId, state, authorType)
      .subscribe({
        next: (updatedComments) => {
          const firstClientComment = updatedComments.find(
            (comment) => comment.authorType === 'client',
          );

          this.notificationService.showNotification(
            'info',
            `Wszystkie komentarze zostały oznaczone jako ${
              firstClientComment?.readByReceiver
                ? 'przeczytane'
                : 'nieprzeczytane'
            }`,
          );
          this.comments = updatedComments;

          this.onUpdateComments();
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  onUpdateComments() {
    const positionWithComments: IPositionWithComments = {
      positionId: this.positionId,
      comments: this.comments,
    };

    this.updateComments.emit(positionWithComments);
  }
}
