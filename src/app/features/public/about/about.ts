import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink, RouterModule } from "@angular/router";
import { ConcertInfoDialog } from '../concerts/concert-list.page/concert-info-dialog/concert-info-dialog';
import { MatIconModule } from '@angular/material/icon';
import { WarningDialog } from '../../../shared/warning-dialog/warning-dialog';
import { PushNotificationService } from '../../../services/push-notification.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { MediaDeviceService } from '../../../services/media-device.service';
import { PwaNotifications } from './pwa-notifications/pwa-notifications';



@Component({
    selector: 'app-about',
    imports: [
        MatButtonModule,
        RouterModule,
        MatIconModule,
        MatDialogModule,
        PwaNotifications
    ],
    templateUrl: './about.html',
    styleUrl: './about.scss',
})
export class About {
    router = inject(Router)
    matDialog = inject(MatDialog)
    authStore = inject(AuthStore)
    pushService = inject(PushNotificationService)

    onProgram() {
        this.router.navigateByUrl('concerts');
    }
    // readonly pushService = inject(PushNotificationService);

    // readonly mediaDeviceService = inject(MediaDeviceService)

    onKoningshut() {
        this.matDialog.open(ConcertInfoDialog, {
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            panelClass: 'fullscreen-dialog',
            data: {
                iframe: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2436.0228680957734!2d4.886607112440338!3d52.37000534720695!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c609c17a3f59bf%3A0xed0464d6be1baa42!2sCaf%C3%A9%20De%20Koningshut!5e0!3m2!1sen!2snl!4v1773484656669!5m2!1sen!2snl" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
            }
        })
    }

    onBert() {
        this.matDialog.open(ConcertInfoDialog, {
            width: '95vw',
            height: '95vh',
            // maxWidth: '100vw',
            // maxHeight: '100vh',
            // panelClass: 'fullscreen-dialog',
            data: {
                iframe: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2436.3559833271356!2d4.935872912439999!3d52.36396484765322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c60900252ed60f%3A0xaa1f1976f59bd605!2sCafe%20Bert!5e0!3m2!1sen!2snl!4v1773492900117!5m2!1sen!2snl" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
            }
        })
    }
    toggleLoading() {
        this.pushService.isLoading.set(!this.pushService.isLoading())
    }

    // readonly isIos = /iPad|iPhone|iPod/.test(
    //     navigator.userAgent
    // ) || (
    //         navigator.platform === 'MacIntel' &&
    //         navigator.maxTouchPoints > 1
    //     );

    // get isAppMode(): boolean {

    //     return (
    //         window.matchMedia('(display-mode: standalone)').matches ||
    //         window.matchMedia('(display-mode: minimal-ui)').matches ||
    //         (navigator as Navigator & { standalone?: boolean })
    //             .standalone === true
    //     );
    // }
    // get isIos(): boolean {
    //     return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    //         (navigator.platform === 'MacIntel' &&
    //             navigator.maxTouchPoints > 1);
    // }

    // get isStandalone(): boolean {
    //     return window.matchMedia(
    //         '(display-mode: standalone)'
    //     ).matches ||
    //         (navigator as Navigator & { standalone?: boolean })
    //             .standalone === true;
    // }
}
