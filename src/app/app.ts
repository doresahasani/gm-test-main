import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './layot/navbar/navbar';
import { Footer } from './layot/footer/footer';
import { FooterActionsService } from './layot/footer/footer-actions.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  private footerActions = inject(FooterActionsService);

  handleWeiter = () => {
    this.footerActions.triggerNext();
  };
}

