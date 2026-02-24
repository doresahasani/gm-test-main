import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
})
export class Footer {
  @Input() onWeiter: (() => void) | null = null;

  onWeiterClick() {
    this.onWeiter?.();
  }
}