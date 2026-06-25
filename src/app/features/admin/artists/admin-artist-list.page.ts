import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArtistsRepository } from '../../../data-access/artists.repository';
import { Artist } from '../../../models/artist.model';

@Component({
    selector: 'app-admin-artist-list-page',
    standalone: true,
    imports: [RouterLink],
    template: `
    <section>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h1>Artists</h1>
        <a routerLink="/admin/artists/new">New artist</a>
      </div>

      @if (loading()) {
        <p>Loading artists...</p>
      } @else if (artists().length === 0) {
        <p>No artists yet.</p>
      } @else {
        <ul style="display: grid; gap: 0.75rem; padding: 0; list-style: none;">
          @for (artist of artists(); track artist.id) {
            <li style="border: 1px solid #ddd; padding: 1rem;">
              <div style="display: flex; justify-content: space-between; gap: 1rem; align-items: start;">
                <div>
                  <strong>{{ artist.name }}</strong><br />
                  <span>{{ artist.instruments.join(', ') }}</span>
                </div>

                <div>
                  <a [routerLink]="['/admin/artists', artist.id]">Edit</a>
                </div>
              </div>
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class AdminArtistListPage {
    readonly loading = signal(true);
    readonly artists = signal<Artist[]>([]);

    constructor(private readonly artistsRepository: ArtistsRepository) {
        void this.load();
    }

    private async load(): Promise<void> {
        try {
            const artists = await this.artistsRepository.getAll();
            this.artists.set(artists);
        } catch (error) {
            console.error(error);
        } finally {
            this.loading.set(false);
        }
    }
}
