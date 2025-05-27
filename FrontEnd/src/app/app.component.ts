import { Component } from '@angular/core';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'jk-tech-frontend';

  constructor(private router: Router) {}

  onNavClick(route: string) {
    console.log('Navigation clicked:', route);
  }

  get isLoggedIn(): boolean {
    // Check if running in browser
    return typeof window !== 'undefined' && !!localStorage.getItem('token');
  }

  get isAdmin(): boolean {
    const user = localStorage.getItem('user');
    return !!user && JSON.parse(user).role === 'admin';
  }

  logout() {
    console.log('User logged out');
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // if you store user info
    this.router.navigate(['/login']);
  }
}
