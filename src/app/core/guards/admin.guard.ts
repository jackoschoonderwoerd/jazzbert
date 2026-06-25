import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

export const AdminGuard: CanActivateFn = () => {
    const router = inject(Router);
    const authStore = inject(AuthStore);

    if (authStore.isAdmin()) {
        return true;
    }

    return router.createUrlTree(['/admin/login']);
};
