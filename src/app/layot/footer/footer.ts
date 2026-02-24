import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,           
  imports: [CommonModule],
  templateUrl: './footer.html',
})
export class Footer {
  @Input() disableWeiter = false;
  @Output() weiter = new EventEmitter<void>();

  onWeiterClick() {
    this.weiter.emit();
  }
}