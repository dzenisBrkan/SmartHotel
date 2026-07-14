import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/landing/landing.component').then((m) => m.LandingComponent) },
      { path: 'rooms', loadComponent: () => import('./features/rooms/list/rooms-list.component').then((m) => m.RoomsListComponent) },
      { path: 'rooms/:id', loadComponent: () => import('./features/rooms/detail/room-detail.component').then((m) => m.RoomDetailComponent) },
      { path: 'auth/login', loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent) },
      { path: 'auth/register', loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent) },
    ],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./features/guest/dashboard/guest-dashboard.component').then((m) => m.GuestDashboardComponent) },
      { path: 'my-reservations', loadComponent: () => import('./features/guest/reservations/my-reservations.component').then((m) => m.MyReservationsComponent), canActivate: [roleGuard(['Gost'])] },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent) },
      { path: 'reservations', loadComponent: () => import('./features/receptionist/reservations/receptionist-reservations.component').then((m) => m.ReceptionistReservationsComponent), canActivate: [roleGuard(['Admin', 'Recepcioner'])] },
      { path: 'checkin', loadComponent: () => import('./features/receptionist/checkin/checkin.component').then((m) => m.CheckinComponent), canActivate: [roleGuard(['Admin', 'Recepcioner'])] },
      { path: 'admin/rooms', loadComponent: () => import('./features/admin/rooms/admin-rooms.component').then((m) => m.AdminRoomsComponent), canActivate: [roleGuard(['Admin'])] },
      { path: 'admin/room-types', loadComponent: () => import('./features/admin/room-types/admin-room-types.component').then((m) => m.AdminRoomTypesComponent), canActivate: [roleGuard(['Admin'])] },
      { path: 'admin/services', loadComponent: () => import('./features/admin/services/admin-services.component').then((m) => m.AdminServicesComponent), canActivate: [roleGuard(['Admin'])] },
      { path: 'admin/users', loadComponent: () => import('./features/admin/users/admin-users.component').then((m) => m.AdminUsersComponent), canActivate: [roleGuard(['Admin'])] },
      { path: 'admin/reservations', loadComponent: () => import('./features/admin/reservations/admin-reservations.component').then((m) => m.AdminReservationsComponent), canActivate: [roleGuard(['Admin'])] },
    ],
  },
  { path: '404', loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent) },
  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent) },
];
