import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './core/auth/auth.store';
import { AuthService } from './core/auth/auth.service';
import { PingService } from './ping.service';
import { UpdateService } from './update.service';
import { interval } from 'rxjs';
import { VisitsRepository } from './data-access/visits.repository';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarService } from './services/snackbar';
import { SwUpdate } from '@angular/service-worker';
import { MatDialog } from '@angular/material/dialog';
import { InstallAppDialog } from './features/public/install-app-dialog/install-app-dialog';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, MatSnackBarModule],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App implements OnInit {
    protected readonly title = signal('jazzbert');

    private readonly authService = inject(AuthService)

    private visitTracker = inject(VisitsRepository);

    readonly authStore = inject(AuthStore)

    readonly loading = this.authStore.loading;



    private readonly pingService = inject(PingService);
    readonly result = signal('Not called yet');
    private appUpdate = inject(UpdateService);
    private sb = inject(SnackbarService);
    private visitRegistered = false;
    private swUpdate = inject(SwUpdate);
    private matDialog = inject(MatDialog)



    constructor() {
        this.authService.init();

        // if (!this.authStore.isLoggedIn()) {
        //     this.visitTracker.addVisit();
        // } else {
        //     this.sb.warning('this visit wil not be registered due to login status', 3000)
        // }

        interval(60 * 60 * 1000).subscribe(() => {
            this.swUpdate.checkForUpdate();
        });

        effect(() => {
            // console.log('loading:', this.authStore.loading());
            // console.log('initialized:', this.authStore.initialized());
            const initialized = this.authStore.initialized();
            const isLoggedIn = this.authStore.isLoggedIn();

            if (!initialized || this.visitRegistered) {
                return;
            }

            this.visitRegistered = true;

            if (!isLoggedIn) {
                this.visitTracker.addVisit();
            } else {
                this.sb.warning(
                    'This visit will not be registered due to login status',
                    3000
                );
            }
        });
    }

    ngOnInit(): void {
        this.appUpdate.init();
        // this.matDialog.open(InstallAppDialog);



    }

    async testPing() {
        console.log('testPinkg(){}')
        try {
            const response = await this.pingService.ping('Angular');
            this.result.set(JSON.stringify(response, null, 2));
        } catch (error) {
            console.error(error);
            this.result.set('Call failed');
        }
    }
}
