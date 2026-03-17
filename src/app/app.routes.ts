import { Routes } from '@angular/router';
import { HomeComponent } from './home-page/home-page';
import { PreviewPageComponent } from './preview-page/preview-page';

export const routes: Routes = [{
    path: '',
    component: HomeComponent,
    title: 'Home',
 },
 {
   path: 'preview-page',
   component: PreviewPageComponent,
 }
];
