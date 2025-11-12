import { Component } from '@angular/core';
import { PositionStatusList } from '../edit-set/PositionStatusList';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-legend',
  imports: [CommonModule],
  templateUrl: './legend.component.html',
  styleUrl: './legend.component.css',
})
export class LegendComponent {

  statuses = PositionStatusList;
}
