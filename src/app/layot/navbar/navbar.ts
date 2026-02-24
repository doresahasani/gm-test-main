import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  @Output() navigateTo = new EventEmitter<number>();

  menuOpen = signal(false);

  constructor(private el: ElementRef<HTMLElement>) {}

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  goTo(step: number) {
    this.navigateTo.emit(step);
    this.closeMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent) {
    const target = event.target as Node;
    if (!this.el.nativeElement.contains(target)) this.closeMenu();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeMenu();
  }
}