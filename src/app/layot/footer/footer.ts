import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
})
export class Footer {
  @Input() disableWeiter = false;
  @Output() weiter = new EventEmitter<void>();

  onWeiterClick() {
    this.weiter.emit();   
  }
}