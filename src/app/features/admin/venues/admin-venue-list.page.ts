import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VenuesRepository } from '../../../data-access/venues.repository';
import { Venue } from '../../../models/venue.model';

@Component({
    selector: 'app-admin-venue-list-page',
    standalone: true,
    imports: [RouterLink],
    template: `
    <section>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h1>Venues</h1>
        <a routerLink="/admin/venues/new">New venue</a>
      </div>

      @if (loading()) {
        <p>Loading venues...</p>
      } @else if (venues().length === 0) {
        <p>No venues yet.</p>
      } @else {
        <ul style="display: grid; gap: 0.75rem; padding: 0; list-style: none;">
          @for (venue of venues(); track venue.id) {
            <li style="border: 1px solid #ddd; padding: 1rem;">
              <div style="display: flex; justify-content: space-between; gap: 1rem; align-items: start;">
                <div>
                  <strong>{{ venue.name }}</strong><br />
                  <span>{{ venue.address }}</span>
                </div>

                <div>
                  <a [routerLink]="['/admin/venues', venue.id]">Edit</a>
                </div>
              </div>
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class AdminVenueListPage {
    readonly loading = signal(true);
    readonly venues = signal<Venue[]>([]);

    constructor(private readonly venuesRepository: VenuesRepository) {
        void this.load();
    }

    private async load(): Promise<void> {
        try {
            const venues = await this.venuesRepository.getAll();
            this.venues.set(venues);
        } catch (error) {
            console.error(error);
        } finally {
            this.loading.set(false);
        }
    }
}
