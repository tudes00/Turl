import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginComponent } from './login/login.component';
import { RedirectComponent } from './redirect/redirect.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', title: 'Turl • Home', component: HomeComponent },
  {
    path: 'dashboard',
    title: 'Turl • Dashboard',
    component: DashboardComponent,
  },
  { path: 'settings', title: 'Turl • Settings', component: SettingsComponent },
  { path: 's/:shortLink', component: RedirectComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '**',
    title: 'Turl • Page not found',
    component: PageNotFoundComponent,
  },
];
