import { Routes } from '@angular/router';
import { HomeComponent } from './home-page/home-page';
import { PreviewPageComponent } from './preview-page/preview-page';
import { PreviewDetailsPageComponent } from './preview-details-page/preview-details-page';

import {
  medicalFormDetailsResolver,
  medicalFormsListResolver
} from './medical-form.resolver';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'edit',
    component: HomeComponent
  },
  {
    path: 'preview',
    component: PreviewPageComponent,
    resolve: {
      forms: medicalFormsListResolver
    }
  },
  {
    path: 'preview/:id',
    component: PreviewDetailsPageComponent,
    resolve: {
      form: medicalFormDetailsResolver
    }
  },
  {
    path: '**',
    redirectTo: ''
  }
];