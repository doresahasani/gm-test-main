import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  @Input() backUrl: string | null = null;
  @Input() nextUrl: string | null = null;

  @Output() back = new EventEmitter<void>();
  @Output() weiter = new EventEmitter<void>();

  constructor(private router: Router) { }

  goBack() {
    if (this.backUrl) this.router.navigate([this.backUrl]);
    else this.back.emit();
  }

  goNext() {
    if (this.nextUrl) this.router.navigate([this.nextUrl]);
    else this.weiter.emit();
  }
}
