import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
    browserLocalPersistence,
    setPersistence,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    type User,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { AuthStore } from './auth.store';


@Injectable({ providedIn: 'root' })
export class AuthService {

    private readonly router = inject(Router);
    private readonly store = inject(AuthStore);

    private initialized = false;

    async init(): Promise<void> {
        if (this.initialized) {
            return;
        }

        this.initialized = true;
        this.store.loading.set(true);

        await setPersistence(auth, browserLocalPersistence);

        onAuthStateChanged(auth, async (user) => {
            await this.applyUser(user);
        });
    }

    async login(email: string, password: string): Promise<void> {
        await signInWithEmailAndPassword(auth, email, password);
        await this.router.navigateByUrl('/admin');
    }

    async logout(): Promise<void> {
        await signOut(auth);
        await this.router.navigateByUrl('/admin/login');
    }

    private async applyUser(user: User | null): Promise<void> {
        this.store.loading.set(true);

        this.store.user.set(user);
        this.store.adminEnabled.set(!!user);
        this.store.loading.set(false);
        this.store.initialized.set(true);
    }
    // private readonly router = inject(Router);
    // private readonly store = inject(AuthStore);

    // private initialized = false;

    // init(): void {
    //     if (this.initialized) {
    //         return;
    //     }
    //     console.log(this.store.loading())
    //     this.initialized = true;
    //     this.store.loading.set(true);

    //     onAuthStateChanged(auth, async (user) => {
    //         await this.applyUser(user);
    //     });
    // }

    // async login(email: string, password: string): Promise<void> {
    //     await signInWithEmailAndPassword(auth, email, password);
    //     await this.router.navigateByUrl('/admin');
    // }

    // async logout(): Promise<void> {
    //     await signOut(auth);
    //     await this.router.navigateByUrl('/admin/login');
    // }

    // private async applyUser(user: User | null): Promise<void> {
    //     this.store.loading.set(true);

    //     if (!user) {
    //         this.store.user.set(null);
    //         this.store.adminEnabled.set(false);
    //         this.store.loading.set(false);
    //         this.store.initialized.set(true);
    //         return;
    //     }

    //     this.store.user.set(user);
    //     this.store.adminEnabled.set(true);
    //     this.store.loading.set(false);
    //     this.store.initialized.set(true);
    // }

}
