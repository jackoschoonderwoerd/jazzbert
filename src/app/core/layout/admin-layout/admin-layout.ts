import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [RouterLink, RouterOutlet, RouterLinkActive, MatIconModule, MatButtonModule],
    templateUrl: './admin-layout.html',
    styleUrls: ['./admin-layout.scss']

})
export class AdminLayout {
    private readonly authService = inject(AuthService);

    logout(): Promise<void> {
        return this.authService.logout();
    }
}
