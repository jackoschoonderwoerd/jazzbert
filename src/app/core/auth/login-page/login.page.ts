import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { AuthStore } from '../auth.store';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input'

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [ReactiveFormsModule, RouterModule, MatButtonModule, MatInput, MatFormFieldModule],
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss']
    //     template: `
    //     <main style="max-width: 420px; margin: 3rem auto;">
    //         <h1>Admin login</h1>

    //         <form [formGroup]="form" (ngSubmit)="submit()">
    //             <div style="margin-bottom: 1rem;">
    //             <label for="email">Email</label><br />
    //             <input id="email" type="email" formControlName="email" />
    //             </div>

    //             <div style="margin-bottom: 1rem;">
    //             <label for="password">Password</label><br />
    //             <input id="password" type="password" formControlName="password" />
    //             </div>

    //             <button type="submit" [disabled]="form.invalid || loading()">
    //             {{ loading() ? 'Signing in...' : 'Sign in' }}
    //             </button>
    //         </form>

    //         @if (error()) {
    //             <p style="color: red; margin-top: 1rem;">{{ error() }}</p>
    //         }
    //         <p>User: {{ authStore.user()?.email ?? 'none' }}</p>
    //         <p>Admin: {{ authStore.isAdmin() }}</p>
    //         <p>Loading: {{ authStore.loading() }}</p>
    //     </main>
    //   `,
})
export class LoginPage {
    private readonly authService = inject(AuthService);

    readonly loading = signal(false);
    readonly error = signal('');
    readonly authStore = inject(AuthStore);

    readonly form = new FormGroup({
        email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
        password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    });

    async submit(): Promise<void> {
        if (this.form.invalid) return;

        this.loading.set(true);
        this.error.set('');

        try {
            const { email, password } = this.form.getRawValue();
            await this.authService.login(email, password)
                .then(() => {
                    console.log('logged in')
                });
        } catch (error) {
            console.error(error);
            this.error.set('Login failed.');
        } finally {
            this.loading.set(false);
        }
    }
}
