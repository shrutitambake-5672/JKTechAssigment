import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  // Replace this with your real auth/role check logic
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user && user.role === 'admin') {
    return true;
  }
  // Redirect to login or another page if not admin
  return inject(Router).createUrlTree(['/login']);
};
