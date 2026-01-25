import { Component, computed, OnInit } from '@angular/core';
import { AuthService } from '../../login/auth.service';
import { CommentsService } from '../comments/comments.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
  imports: [],
})
export class WelcomeComponent implements OnInit {
  messageUnread: string = '';
  messageNeedsAttention: string = '';
  user = computed(() => this.authService.user());

  constructor(
    private authService: AuthService,
    private commentsService: CommentsService,
  ) {}

  ngOnInit(): void {
    this.commentsService.unreadComments().subscribe((unreadComments) => {
      const { unread, needsAttention } = { ...unreadComments };

      this.messageUnread = `Masz ${unread} ${this.pluralize(
        unread,
        'nowy komentarz',
        'nowe komentarze',
        'nowych komentarzy',
      )}`;

      this.messageNeedsAttention = `Masz ${needsAttention} ${this.pluralize(
        needsAttention,
        'komentarz oznaczony jako ważny',
        'komentarze oznaczone jako ważne',
        'komentarzy oznaczonych jako ważne',
      )}`;
    });
  }


  private pluralize(
    count: number,
    one: string,
    few: string,
    many: string,
  ): string {
    if (count === 1) {
      return one;
    }

    if (
      count % 10 >= 2 &&
      count % 10 <= 4 &&
      !(count % 100 >= 12 && count % 100 <= 14)
    ) {
      return few;
    }

    return many;
  }
}
