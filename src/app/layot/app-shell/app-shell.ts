import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { NavigationService } from '../../_service/navigation.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [Navbar, Footer, RouterOutlet],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  private nav = inject(NavigationService);

  onWeiter() {
    this.nav.requestWeiter();
  }
}

