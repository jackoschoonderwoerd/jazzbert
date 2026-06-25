import { DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConcertsRepository } from '../../../../data-access/concerts.repository';
import { Concert } from '../../../../models/concert.model';

import { ArtistsRepository } from '../../../../data-access/artists.repository';
import { Artist } from '../../../../models/artist.model';
import { ConcertView } from '../../../../models/concert-view.model';
import { PublicConcertsService } from '../../../public/concerts/public-concerts.service';
import { MatIconModule } from '@angular/material/icon';
import * as XLSX from 'xlsx';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-admin-concert-list-page',
    standalone: true,
    imports: [RouterLink, DatePipe, MatIconModule, MatButtonModule],
    templateUrl: './admin-concert-list.page.html',
    styleUrls: ['./admin-concert-list.page.scss'],

})
export class AdminConcertListPage {
    readonly loading = signal(true);
    readonly concerts = signal<Concert[]>([]);
    readonly concertsViews = signal<ConcertView[]>([]);
    readonly artists = signal<Artist[]>([])

    showFutureConcertViewsOnly = signal(true);

    visibleConcertViews = computed(() => {
        const concerViews = this.concertsViews();

        if (!this.showFutureConcertViewsOnly()) {
            return concerViews;
        }

        const now = new Date();
        return concerViews.filter(view => view.startAt > now);
    });


    constructor(
        private readonly concertsRepository: ConcertsRepository,
        private readonly artistsRepository: ArtistsRepository,
        private readonly publicConcertsService: PublicConcertsService
    ) {
        void this.load();
        void this.loadConcertsViews();
    }

    private async load(): Promise<void> {
        console.log('1')
        try {
            const concerts = await this.concertsRepository.getAll();
            this.concerts.set(
                [...concerts].sort(
                    (a, b) => b.startAt.toMillis() - a.startAt.toMillis(),
                ),
            );
        } catch (error) {
            console.error(error);
        } finally {
            this.loading.set(false);
        }
    }

    private async loadConcertsViews(): Promise<void> {

        console.log('2')
        try {
            const concertsViews = await this.publicConcertsService.getAll();
            this.concertsViews.set(concertsViews);
        } catch (error) {
            console.error(error);
        } finally {
            this.loading.set(false);
        }
    }

    private formatTime(date: Date): string {
        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    private formatDate(date: Date): string {
        return new Date(date).toLocaleDateString([], {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    }

    exportEventsXlsx() {
        const rows = this.visibleConcertViews().map(event => ({
            Date: this.formatDate(event.startAt), // <-- added
            Start: this.formatTime(event.startAt),
            End: this.formatTime(event.endAt),
            Venue: event.venue?.name ?? '',
            Address: event.venue?.address ?? '',
            Artists: event.artists
                ?.map(a => `${a.name} (${a.instruments ?? ''})`)
                .join(', ') ?? '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);

        worksheet['!cols'] = [
            { wch: 12 }, // Date
            { wch: 10 }, // Start
            { wch: 10 }, // End
            { wch: 28 }, // Venue
            { wch: 35 }, // Address
            { wch: 50 }, // Artists
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Events');

        XLSX.writeFile(workbook, 'events.xlsx', { compression: true });
    }

    exportEventsJson() {
        const rows = this.visibleConcertViews().map(event => ({
            ProjectHomepage: 'www.jazzfry.nl',
            Date: this.formatDate(event.startAt),
            Start: this.formatTime(event.startAt),
            End: this.formatTime(event.endAt),
            Venue: event.venue?.name ?? '',
            VenueHomepage: event.venue?.homepageUrl ?? '',
            Address: event.venue?.address ?? '',
            Artists: event.artists
                ?.map(a => `${a.name} (${a.instruments ?? ''})`)
                .join(', ') ?? '',
        }));

        const json = JSON.stringify(rows, null, 2); // pretty printed

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'events.json';
        a.click();

        URL.revokeObjectURL(url);
    }
}
