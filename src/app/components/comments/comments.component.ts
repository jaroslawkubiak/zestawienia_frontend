import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommentsService } from './comments.service';
import { IComment } from './types/IComment';

@Component({
  selector: 'app-comments',
  imports: [CommonModule, FormsModule],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css',
})
export class CommentsComponent {
  @Input() setId!: number;
  @Input() positionId!: number;
  @Input() comments: IComment[] = [];
  @Input() commentsDialog = false;

  newMessage: string = '';

  editedCommentId: number | null = null;
  @ViewChild('chatContainer') private chatContainerRef!: ElementRef;

  constructor(private commentsService: CommentsService) {}

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
    this.commentsService.deleteComment(id).subscribe({
      next: (response) => {
        this.comments = this.comments.filter((item) => item.id !== id);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
