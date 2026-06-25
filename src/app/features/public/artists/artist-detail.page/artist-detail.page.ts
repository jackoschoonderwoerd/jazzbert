import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Artist } from '../../../../models/artist.model';
import { BiographyLanguage } from '../../../../models/language.model';
import { PublicArtistsService } from '../public-artists.service';

@Component({
    selector: 'app-artist-detail-page',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './artist-detail.page.html',
    styleUrls: ['./artist-detail.page.scss'],


})
export class ArtistDetailPage {
    private readonly route = inject(ActivatedRoute);
    private readonly publicArtistsService = inject(PublicArtistsService);

    readonly loading = signal(true);
    readonly artist = signal<Artist | null>(null);
    readonly language = signal<BiographyLanguage>('nl');

    constructor() {
        void this.load();
    }

    currentBiography(): string {
        const artist = this.artist();

        if (!artist) {
            return '';
        }

        return this.language() === 'nl' ? artist.bios.nl : artist.bios.en;
    }

    setLanguage(language: BiographyLanguage): void {
        this.language.set(language);
    }

    private async load(): Promise<void> {
        try {
            const id = this.route.snapshot.paramMap.get('id');

            if (!id) {
                this.loading.set(false);
                return;
            }

            const artist = await this.publicArtistsService.getArtistById(id);
            this.artist.set(artist);
        } catch (error) {
            console.error(error);
        } finally {
            this.loading.set(false);
        }
    }
}
