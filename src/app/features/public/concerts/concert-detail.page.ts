import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConcertView } from '../../../models/concert-view.model';
import { PublicConcertsService } from './public-concerts.service';

@Component({
    selector: 'app-concert-detail-page',
    standalone: true,
    imports: [RouterLink, DatePipe],
    template: `
    <section>
      <p>
        <a routerLink="/concerts">← Back to concerts</a>
      </p>

      @if (loading()) {
        <p>Loading concert...</p>
      } @else if (!concert()) {
        <p>Concert not found.</p>
      } @else {
        <h1>{{ concert()!.startAt | date: 'fullDate' }}</h1>

        <p>
          <strong>Time:</strong>
          {{ concert()!.startAt | date: 'HH:mm' }} – {{ concert()!.endAt | date: 'HH:mm' }}
        </p>

        @if (concert()!.venue) {
          <section style="margin-bottom: 1rem;">
            <h2>Venue</h2>
            <p><strong>{{ concert()!.venue!.name }}</strong></p>
            <p>{{ concert()!.venue!.address }}</p>

            @if (concert()!.venue!.homepageUrl) {
              <p>
                <a [href]="concert()!.venue!.homepageUrl" target="_blank" rel="noopener noreferrer">
                  Venue website
                </a>
              </p>
            }

            @if(concert()!.description){
                <div [innerHTML]="concert()!.description"></div>
            }

            @if (concert()!.venue!.socialLinks.instagram) {
              <p>
                <a
                  [href]="concert()!.venue!.socialLinks.instagram!"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </p>
            }

            @if (concert()!.venue!.socialLinks.facebook) {
              <p>
                <a
                  [href]="concert()!.venue!.socialLinks.facebook!"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </p>
            }
          </section>
        }

        <section style="margin-bottom: 1rem;">
          <h2>Description</h2>
          <p style="white-space: pre-wrap;">{{ concert()!.description }}</p>
        </section>

        <section>
          <h2>Artists</h2>

          <ul style="padding-left: 1.25rem;">
            @for (artist of concert()!.artists; track artist.id) {
              <li>
                <a [routerLink]="['/artists', artist.id]">
                  @if (artist.featured) {
                    <strong>{{ artist.name }}</strong>
                  } @else {
                    {{ artist.name }}
                  }
                </a>
              </li>
            }
          </ul>
        </section>
      }
    </section>
  `,
})
export class ConcertDetailPage {
    private readonly route = inject(ActivatedRoute);
    private readonly publicConcertsService = inject(PublicConcertsService);

    readonly loading = signal(true);
    readonly concert = signal<ConcertView | null>(null);

    constructor() {
        void this.load();
    }

    private async load(): Promise<void> {
        try {
            const id = this.route.snapshot.paramMap.get('id');

            if (!id) {
                this.loading.set(false);
                return;
            }

            const concert = await this.publicConcertsService.getConcertById(id);
            this.concert.set(concert);
        } catch (error) {
            console.error(error);
        } finally {
            this.loading.set(false);
        }
    }
}
