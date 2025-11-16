import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup.html',
  styleUrls: ['./popup.scss'],
})
export class PopupComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'warning' = 'success';
  @Input() visible: boolean = false;

  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
