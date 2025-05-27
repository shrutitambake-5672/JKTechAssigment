import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api-url.token';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = inject(API_URL);
  private http = inject(HttpClient);

  constructor() { }

  signup(data: { name: string; password: string;}): Observable<any> {
    // Adjust endpoint as per your backend (e.g., /register or /auth/register)
    return this.http.post(`${this.apiUrl}auth/register`, {
      username: data.name,
      password: data.password
      });
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/login`, credentials);
  }

  // Optional: Test API connection
  testApiConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}health`);
  }
}
