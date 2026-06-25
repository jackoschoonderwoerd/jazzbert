import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet, RouterLinkActive, Router } from '@angular/router';
import { MatAnchor } from "@angular/material/button";
import { AuthService } from '../../auth/auth.service';
import { AuthStore } from '../../auth/auth.store';

@Component({
    selector: 'app-public-layout',
    standalone: true,
    imports: [RouterLink, RouterOutlet, MatIconModule, RouterLinkActive, MatAnchor],
    templateUrl: './public-layout.html',
    styleUrls: ['./public-layout.scss']
})
export class PublicLayout {

    authService = inject(AuthService);
    authStore = inject(AuthStore)
    router = inject(Router)

    toAdmin() {
        if (this.authStore.isLoggedIn()) {
            this.router.navigateByUrl('/admin');
        } else {
            this.router.navigateByUrl('login');
        }
    }
}
