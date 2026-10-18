import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class MediaDeviceService {
    readonly isIos = /iPad|iPhone|iPod/.test(
        navigator.userAgent
    ) || (
            navigator.platform === 'MacIntel' &&
            navigator.maxTouchPoints > 1
        );

    get isAppMode(): boolean {

        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.matchMedia('(display-mode: minimal-ui)').matches ||
            (navigator as Navigator & { standalone?: boolean })
                .standalone === true
        );
    }
}
