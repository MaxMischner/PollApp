import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'survey/create',
    loadComponent: () =>
      import('./pages/create-survey/create-survey-page.component').then(
        (m) => m.CreateSurveyPageComponent
      ),
  },
  {
    path: 'survey/:id',
    loadComponent: () =>
      import('./pages/survey-detail/survey-detail.component').then(
        (m) => m.SurveyDetailComponent
      ),
  },
];
