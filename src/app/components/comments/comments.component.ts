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
import { CommentsService } from './comments.service';
import { IComment } from './types/IComment';

@Component({
  selector: 'app-comments',
  imports: [CommonModule, FormsModule, TooltipModule],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css',
})
export class CommentsComponent implements AfterViewInit, OnChanges {
  @Input() setId!: number;
  @Input() positionId!: number;
  @Input() comments: IComment[] = [];
  @Input() commentsDialog = false;
  @Output() updateComments = new EventEmitter<any>();
  newMessage: string = '';

  editedCommentId: number | null = null;
  @ViewChild('chatContainer') private chatContainerRef!: ElementRef;

  constructor(
    private commentsService: CommentsService,
    private notificationService: NotificationService,
    private confirmationModalService: ConfirmationModalService,
    private soundService: SoundService
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
    if (!this.newMessage.trim()) return;

    // add new comment
    if (!this.editedCommentId) {
      this.commentsService
        .addComment(this.newMessage, this.setId, this.positionId)
        .subscribe({
          next: (response) => {
            this.comments.push(response);
            this.newMessage = '';
            this.soundService.playSound(SoundType.messageSending);
            setTimeout(() => {
              this.scrollToBottom();
            }, 100);
          },
          error: (error) => {
            console.error(error);
          },
        });
    } else {
      // edit comment
      this.commentsService
        .editComment(this.editedCommentId, this.newMessage)
        .subscribe({
          next: (response) => {
            const commentIndex = this.comments.findIndex(
              (item) => item.id === this.editedCommentId
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
      next: (response: IComment[]) => {
        const updatedComment = response[0];

        this.notificationService.showNotification(
          'info',
          `Komentarz został oznaczony jako ${
            updatedComment.readByReceiver ? 'przeczytany' : 'nieprzeczytany'
          }`
        );

        this.comments = this.comments.map((item) =>
          item.id === updatedComment.id
            ? { ...item, readByReceiver: updatedComment.readByReceiver }
            : item
        );

        const positionWithComments = {
          posId: this.positionId,
          comments: this.comments,
        };

        this.updateComments.emit(positionWithComments);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  markAllComments(state: boolean) {
    this.commentsService.markAllComments(this.positionId, state).subscribe({
      next: (updatedComments) => {
        const firstClientComment = updatedComments.find(
          (comment) => comment.authorType === 'client'
        );

        this.notificationService.showNotification(
          'info',
          `Wszystkie komentarze zostały oznaczone jako ${
            firstClientComment?.readByReceiver
              ? 'przeczytane'
              : 'nieprzeczytane'
          }`
        );

        this.comments = updatedComments;

        const positionWithComments = {
          posId: this.positionId,
          comments: this.comments,
        };

        this.updateComments.emit(positionWithComments);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
