import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  @Input() disableWeiter = false;

  @Output() weiter = new EventEmitter<void>();

  onWeiterClick() {
    this.weiter.emit();
  }
}
