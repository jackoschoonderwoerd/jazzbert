import { Component, inject, OnInit } from '@angular/core';
import { PushNotificationService } from '../../../../services/push-notification.service';
import { MediaDeviceService } from '../../../../services/media-device.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { InstallAppDialog } from '../../install-app-dialog/install-app-dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-pwa-notifications',
    imports: [MatIconModule, MatButtonModule, MatProgressSpinnerModule],
    templateUrl: './pwa-notifications.html',
    styleUrl: './pwa-notifications.scss',
})
export class PwaNotifications implements OnInit {


    readonly pushService = inject(PushNotificationService);

    readonly mediaDeviceService = inject(MediaDeviceService)
    matDialog = inject(MatDialog)

    showInstallInstructions() {
        alert('showInstallInstructions(){}')
        this.matDialog.open(InstallAppDialog)
    }

    ngOnInit(): void {
        // this.pushService.isSubscribed.set(true)
        // this.pushService.isSupported = true;
    }
}
