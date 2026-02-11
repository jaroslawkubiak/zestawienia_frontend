import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { IColumn } from '../../shared/types/ITable';
import { CommentNotificationService } from './comment-notification.service';
import { ICommentNotificationLogs } from './types/ICommentNotificationLogs';

@Component({
  selector: 'app-comment-notification',
  imports: [
    TableModule,
    InputTextModule,
    CommonModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    Dialog,
    ButtonModule,
    LoadingSpinnerComponent,
    TooltipModule,
  ],
  templateUrl: './comment-notification.component.html',
  styleUrl: './comment-notification.component.css',
})
export class CommentNotificationComponent {
  @ViewChild('dt') dt!: Table;
  commentNotificationList!: ICommentNotificationLogs[];
  cols!: IColumn[];
  previewDialog = false;
  isLoading = true;
  previewDialogHeader = '';
  htmlContent!: SafeHtml;

  constructor(
    private commentNotificationService: CommentNotificationService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.commentNotificationService.getCommentNotifications().subscribe({
      next: (data) => {
        this.commentNotificationList = data;

        this.isLoading = false;
        this.cd.markForCheck();
      },
      error: (err) =>
        console.error('Error getting comment notifications ', err),
    });
  }

  openSet(setId: number) {
    this.router.navigate([`/sets/${setId}`]);
  }

  openNotificationPreview(id: number) {
    const notification = this.commentNotificationList.find(
      (notification) => notification.id === id,
    );
    if (!notification) {
      return;
    }

    this.previewDialogHeader = `Inwestycja : ${notification.set.name}`;

    this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(
      notification.content.replace(
        /<body.*?>|<\/body>|<html.*?>|<\/html>|<head.*?>.*?<\/head>/g,
        '',
      ),
    );

    this.previewDialog = true;
  }

  onDialogClosed() {
    this.htmlContent = '';
    this.previewDialogHeader = '';
    this.previewDialog = false;
  }
  onGlobalFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (this.dt) {
      this.dt.filterGlobal(inputElement.value, 'contains');
    }
  }
}
