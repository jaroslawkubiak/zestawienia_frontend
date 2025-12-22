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
  message: string = '';

  constructor(
    private authService: AuthService,
    private commentsService: CommentsService
  ) {}

  ngOnInit(): void {
    this.commentsService.unreadComments().subscribe((count) => {
      switch (true) {
        case count === 1:
          this.message = `Masz ${count} nowy komentarz`;
          break;

        case count > 1 && count < 5:
          this.message = `Masz ${count} nowe komentarze`;
          break;

        default:
          this.message = `Masz ${count} nowych komentarzy`;
      }
    });
  }

  user = computed(() => this.authService.user());
}
