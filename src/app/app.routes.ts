import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth-guard';
import { isLoggedGuard } from './core/guards/is-logged-guard';
import { NotfoundComponent } from './features/notfound/notfound.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth-layout
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [isLoggedGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./core/auth/login/login.component').then((c) => c.LoginComponent),
        title: 'Login-Page',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./core/auth/register/register.component').then((c) => c.RegisterComponent),
        title: 'Register-Page',
      },
      {
        path: 'forgot',
        loadComponent: () =>
          import('./core/auth/forgot-password/forgot-password.component').then(
            (c) => c.ForgotPasswordComponent,
          ),
        title: 'Forgot-Page',
      },
    ],
  },

  //main-layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/home/home.component').then((c) => c.HomeComponent),
        title: 'Home-Page',
      },
    ],
  },
  { path: '**', component: NotfoundComponent, title: 'Notfound-Page' },
];
