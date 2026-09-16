import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'cards' },
  {
    path: 'cards',
    loadComponent: () =>
      import('./features/cards/pages/cards-page').then((module) => module.CardsPage),
  },
  {
    path: 'cards/:id',
    loadComponent: () =>
      import('./features/cards/pages/card-detail-page').then((module) => module.CardDetailPage),
  },
  { path: '**', redirectTo: 'cards' },
];
