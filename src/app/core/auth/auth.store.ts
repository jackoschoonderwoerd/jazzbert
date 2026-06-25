import { Injectable, computed, signal } from '@angular/core';
import type { User } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthStore {
    readonly user = signal<User | null>(null);
    readonly adminEnabled = signal(false);
    readonly loading = signal(true);
    readonly initialized = signal(false);

    readonly isLoggedIn = computed(() => this.user() !== null);
    readonly isAdmin = computed(() => this.isLoggedIn() && this.adminEnabled());
}
