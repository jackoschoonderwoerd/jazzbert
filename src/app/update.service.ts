import { ApplicationRef, inject, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';

import { concat, filter, first, interval } from 'rxjs';


@Injectable({
    providedIn: 'root',
})
export class UpdateService {
    private readonly swUpdate = inject(SwUpdate);
    private readonly appRef = inject(ApplicationRef);
    private initialized = false;

    init(): void {
        // alert('update init()');
        // Prevent multiple initializations
        if (this.initialized || !this.swUpdate.isEnabled) return;
        this.initialized = true;

        // Listen for new versions
        this.swUpdate.versionUpdates
            .pipe(
                filter((event): event is VersionReadyEvent =>
                    event.type === 'VERSION_READY'
                )
            )
            .subscribe(() => {
                const reload = confirm('A new version is available. Reload now?');
                if (reload) {
                    document.location.reload();
                }
            });

        // Wait until app is stable, then periodically check
        const appIsStable$ = this.appRef.isStable.pipe(
            filter(Boolean),
            first()
        );

        concat(appIsStable$, interval(6 * 60 * 60 * 1000)).subscribe(() => {
            this.swUpdate.checkForUpdate();
        });
    }
}
