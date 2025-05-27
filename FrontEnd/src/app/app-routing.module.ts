import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { DocumentManagementComponent } from './documents/document-management/document-management.component';
import { IngestionManagementComponent } from './ingestion/ingestion-management/ingestion-management.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'user-management', component: UserManagementComponent },
  { path: 'document-management', component: DocumentManagementComponent },
  { path: 'ingestion-management', component: IngestionManagementComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
