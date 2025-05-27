import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  submitted = false;
  passwordMismatch = false;
  signupError: string | null = null;
  signupSuccess: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;
    this.passwordMismatch = false;
    this.signupError = null;
    this.signupSuccess = null;

    if (this.signupForm.invalid) return;

    const password = this.signupForm.value['password'];
    const confirmPassword = this.signupForm.value['confirmPassword'];
    if (password !== confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    // Call the AuthService signup function
    this.authService.signup({
      name: this.signupForm.value['name'],
      password: this.signupForm.value['password']    }).subscribe({
      next: (res) => {
        this.signupSuccess = 'Signup successful!';
        this.signupForm.reset();
        this.submitted = false;
      },
      error: (err) => {
        this.signupError = 'Signup failed. Please try again.';
      }
    });
  }
}
