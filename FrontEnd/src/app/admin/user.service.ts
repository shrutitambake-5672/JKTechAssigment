import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api-url.token';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = inject(API_URL);
  private http = inject(HttpClient);

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}users/`);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}users/${userId}/role`, { role });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}users/${userId}`);
  }

  addUser(user: { username: string; password: string;}): Observable<any> {
    return this.http.post(`${this.apiUrl}users/`, user);
  }

  updateUser(userId: string, user: { username: string; role: string }): Observable<any> {
    console.timeLog('Update User',user);
    return this.http.put(`${this.apiUrl}users/${userId}`, user);
  }

  // Add more methods as needed
}
