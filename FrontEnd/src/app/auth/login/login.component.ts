import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../auth.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router // <-- Inject Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;
    this.loginError = null;

    if (this.loginForm.invalid) return;

    this.authService.login({
      username: this.loginForm.value['username'],
      password: this.loginForm.value['password']
    }).subscribe({
      next: (res) => {
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('token', res.access_token); // <-- Store the token
        this.loginForm.reset();
        this.submitted = false;
        this.router.navigate(['/document-management']);
      },
      error: (err) => {
        this.loginError = 'Login failed. Please check your credentials.';
      }
    });



}
}
