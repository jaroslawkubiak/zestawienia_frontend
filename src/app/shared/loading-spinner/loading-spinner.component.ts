import { Component, Input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.css',
  imports: [ProgressSpinnerModule],
  standalone: true,
})
export class LoadingSpinnerComponent {
  @Input() size: number = 100;
  @Input() stroke: string = "2";
}
