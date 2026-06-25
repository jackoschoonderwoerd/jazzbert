import { DatePipe, JsonPipe, NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConcertView } from '../../../../models/concert-view.model';
import { PublicConcertsService } from '../public-concerts.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ConcertInfoDialog } from './concert-info-dialog/concert-info-dialog';
import { ArtistDetailPage } from '../../artists/artist-detail.page/artist-detail.page';
import { ArtistDetailDialog } from '../../artists/artist-detail-dialog/artist-detail-dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-concert-list-page',
    standalone: true,
    imports: [DatePipe, MatExpansionModule, MatIconModule, NgClass, MatButtonModule],
    templateUrl: './concert-list.page.html',
    styleUrls: ['./concert-list.page.scss'],
})
export class ConcertListPage {
    readonly loading = signal(true);
    readonly concerts = signal<ConcertView[]>([]);
    matDialog = inject(MatDialog)

    constructor(private readonly publicConcertsService: PublicConcertsService) {
        void this.load();
    }

    private async load(): Promise<void> {
        try {
            const concerts = await this.publicConcertsService.getUpcomingConcerts();
            this.concerts.set(concerts);
        } catch (error) {
            console.error(error);
        } finally {
            this.loading.set(false);
        }
    }

    onIframe(iframe: string | undefined) {
        if (!iframe) return;
        console.log(iframe)
        this.matDialog.open(ConcertInfoDialog, {
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            panelClass: 'fullscreen-dialog',
            data: {
                iframe
            }
        })
    }
    onArtistInfo(id: string) {

        this.matDialog.open(ArtistDetailDialog, {
            width: '100vw',
            // height: '100vh',
            maxWidth: '500px',
            maxHeight: '100vh',
            // panelClass: 'fullscreen-dialog',
            data: {
                id
            }
        })
    }
    stripHtml(html: string): string {
        const div = document.createElement('div');
        div.innerHTML = html;
        return (div.textContent || div.innerText || '').trim();
    }
    startsAtSeven(date: Date) {
        // console.log(date.getHours())
        const twoMonthsFromNow: Date = new Date(2026, 8, 24)
        const today: Date = new Date()
        // console.log(today < twoMonthsFromNow)
        return date.getHours() === 19 && today < twoMonthsFromNow
    }
}
