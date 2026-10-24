import { Component, computed, OnInit } from '@angular/core';
import { AuthService } from '../../login/auth.service';
import { pluralizePL } from '../../shared/helpers/pluralizePL';
import { CommentsService } from '../comments/comments.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
  imports: [],
})
export class WelcomeComponent implements OnInit {
  messageUnreadForPositions: string = '';
  messageNeedsAttentionForPositions: string = '';
  messageUnreadForFiles: string = '';
  messageNeedsAttentionForFiles: string = '';
  user = computed(() => this.authService.user());

  constructor(
    private authService: AuthService,
    private commentsService: CommentsService,
  ) {}

  ngOnInit(): void {
    this.commentsService.unreadComments().subscribe((response) => {
      const { unreadForPositions, needsAttentionForPositions } =
        response.positions;
      const { unreadForFiles, needsAttentionForFiles } = response.files;

      this.messageUnreadForPositions = `Masz ${unreadForPositions} ${pluralizePL(
        unreadForPositions,
        'nowy komentarz',
        'nowe komentarze',
        'nowych komentarzy',
      )} dla pozycji`;

      this.messageNeedsAttentionForPositions = `Masz ${needsAttentionForPositions} ${pluralizePL(
        needsAttentionForPositions,
        'komentarz oznaczony jako wymagający uwagi',
        'komentarze oznaczone jako wymagające uwagi',
        'komentarzy oznaczonych jako wymagające uwagi',
      )} dla pozycji`;

      this.messageUnreadForFiles = `Masz ${unreadForFiles} ${pluralizePL(
        unreadForFiles,
        'nowy komentarz',
        'nowe komentarze',
        'nowych komentarzy',
      )} dla plików`;

      this.messageNeedsAttentionForFiles = `Masz ${needsAttentionForFiles} ${pluralizePL(
        needsAttentionForFiles,
        'komentarz oznaczony jako wymagający uwagi',
        'komentarze oznaczone jako wymagające uwagi',
        'komentarzy oznaczonych jako wymagające uwagi',
      )} dla plików`;
    });
  }
}
