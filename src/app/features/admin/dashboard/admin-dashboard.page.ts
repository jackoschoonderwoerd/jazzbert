import { DatePipe, JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArtistsRepository } from '../../../data-access/artists.repository';
import { ConcertsRepository } from '../../../data-access/concerts.repository';
import { VenuesRepository } from '../../../data-access/venues.repository';
import { Concert } from '../../../models/concert.model';
import * as XLSX from 'xlsx';
import { Artist } from '../../../models/artist.model';
import { VisitsRepository } from '../../../data-access/visits.repository'

@Component({
    selector: 'app-admin-dashboard-page',
    standalone: true,
    imports: [RouterLink, DatePipe],
    templateUrl: './admin-dashboard.page.html',
    styleUrls: ['./admin-dashboard.page.scss'],

})
export class AdminDashboardPage {
    readonly loading = signal(true);
    readonly error = signal('');

    readonly artistCount = signal(0);
    readonly venueCount = signal(0);
    readonly concertCount = signal(0);
    readonly publishedConcertCount = signal(0);
    readonly draftConcertCount = signal(0);
    readonly upcomingConcertCount = signal(0);
    readonly pastConcertCount = signal(0);
    readonly artistName = signal('')
    readonly visitsCount = signal(0)

    readonly upcomingConcerts = signal<Concert[]>([]);

    constructor(
        private readonly artistsRepository: ArtistsRepository,
        private readonly venuesRepository: VenuesRepository,
        private readonly concertsRepository: ConcertsRepository,
        private readonly visitsRepository: VisitsRepository
    ) {
        void this.load();
    }

    private async load(): Promise<void> {
        try {
            const [artists, venues, concerts, visits] = await Promise.all([
                this.artistsRepository.getAll(),
                this.venuesRepository.getAll(),
                this.concertsRepository.getAll(),
                this.visitsRepository.getAll()
            ]);

            const now = new Date();

            const published = concerts.filter((concert) => concert.status === 'published');
            const drafts = concerts.filter((concert) => concert.status === 'draft');
            const upcoming = concerts
                .filter((concert) => concert.startAt.toDate() >= now)
                .sort((a, b) => a.startAt.toMillis() - b.startAt.toMillis());
            const past = concerts.filter((concert) => concert.startAt.toDate() < now);

            this.artistCount.set(artists.length);
            this.venueCount.set(venues.length);
            this.concertCount.set(concerts.length);
            this.publishedConcertCount.set(published.length);
            this.draftConcertCount.set(drafts.length);
            this.upcomingConcertCount.set(upcoming.length);
            this.pastConcertCount.set(past.length);
            this.upcomingConcerts.set(upcoming.slice(0, 5));
            this.visitsCount.set(visits.length)
        } catch (error) {
            console.error(error);
            this.error.set('Failed to load dashboard.');
        } finally {
            this.loading.set(false);
        }
    }




    getArtistNameById(id: string) {
        this.artistsRepository.getById(id).then((artist: any) => {
            this.artistName.set(artist.name)
        })
    }
}
