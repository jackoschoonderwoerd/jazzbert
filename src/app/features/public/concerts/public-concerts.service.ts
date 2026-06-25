import { Injectable } from '@angular/core';
import { ArtistsRepository } from '../../../data-access/artists.repository';
import { ConcertsRepository } from '../../../data-access/concerts.repository';
import { VenuesRepository } from '../../../data-access/venues.repository';
import { Artist } from '../../../models/artist.model';
import { Concert } from '../../../models/concert.model';
import { ConcertView } from '../../../models/concert-view.model';
import { Venue } from '../../../models/venue.model';

@Injectable({ providedIn: 'root' })
export class PublicConcertsService {
    constructor(
        private readonly concertsRepository: ConcertsRepository,
        private readonly artistsRepository: ArtistsRepository,
        private readonly venuesRepository: VenuesRepository,
    ) { }

    async getUpcomingConcerts(): Promise<ConcertView[]> {
        const [concerts, artists, venues] = await Promise.all([
            this.concertsRepository.getUpcomingPublished(new Date()),
            // this.concertsRepository.getAll(),
            this.artistsRepository.getAll(),
            this.venuesRepository.getAll(),
        ]);

        return this.toConcertViews(concerts, artists, venues);
    }

    async getAll(): Promise<ConcertView[]> {
        const [concerts, artists, venues] = await Promise.all([
            this.concertsRepository.getAll(),
            // this.concertsRepository.getAll(),
            this.artistsRepository.getAll(),
            this.venuesRepository.getAll(),
        ]);

        return this.toConcertViews(concerts, artists, venues);
    }


    async getConcertById(id: string): Promise<ConcertView | null> {
        const concert = await this.concertsRepository.getById(id);

        if (!concert || concert.status !== 'published') {
            return null;
        }

        const [artists, venues] = await Promise.all([
            this.artistsRepository.getAll(),
            this.venuesRepository.getAll(),
        ]);

        const views = this.toConcertViews([concert], artists, venues);
        return views[0] ?? null;
    }

    private toConcertViews(
        concerts: Concert[],
        artists: Artist[],
        venues: Venue[],
    ): ConcertView[] {
        const artistsById = new Map(artists.map((artist) => [artist.id, artist]));
        const venuesById = new Map(venues.map((venue) => [venue.id, venue]));

        return concerts
            .filter((concert) => concert.status === 'published')
            .sort((a, b) => a.startAt.toMillis() - b.startAt.toMillis())
            .map((concert) => {
                const venue = venuesById.get(concert.venueId) ?? null;

                const artistViews = [...concert.artistEntries]
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((entry) => {
                        const artist = artistsById.get(entry.artistId);

                        if (!artist) {
                            return null;
                        }

                        return {
                            id: artist.id,
                            name: artist.name,
                            slug: artist.slug,
                            instruments: artist.instruments,
                            featured: entry.featured,
                            sortOrder: entry.sortOrder,
                        };
                    })
                    .filter((artist): artist is NonNullable<typeof artist> => artist !== null);

                return {
                    id: concert.id,
                    startAt: concert.startAt.toDate(),
                    endAt: concert.endAt.toDate(),
                    description: concert.description,
                    status: concert.status,
                    venue: venue
                        ? {
                            id: venue.id,
                            name: venue.name,
                            address: venue.address,
                            homepageUrl: venue.homepageUrl,
                            locationIframe: venue.locationIframe,
                            socialLinks: venue.socialLinks,
                        }
                        : null,
                    artists: artistViews,
                };
            });
    }
}
