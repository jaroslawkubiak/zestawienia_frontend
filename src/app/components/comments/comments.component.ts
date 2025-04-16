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
  sendMessage() {
    if (!this.newMessage.trim()) return;

    this.commentsService
      .addComment(this.newMessage, this.setId, this.positionId)
      .subscribe({
        next: (response) => {
          this.comments.push(response);
          this.newMessage = '';
        },
        error: (error) => {
          console.error(error);
        },
      });
  }
}
