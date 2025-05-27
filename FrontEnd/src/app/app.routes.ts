import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { DocumentManagementComponent } from './documents/document-management/document-management.component';
import { adminGuard } from './admin/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'logout', component: LogoutComponent },
  {
    path: 'user-management',
    component: UserManagementComponent,
    canActivate: [adminGuard]
  },
  { path: 'document-management', component: DocumentManagementComponent }
  // Add more routes as needed
];
