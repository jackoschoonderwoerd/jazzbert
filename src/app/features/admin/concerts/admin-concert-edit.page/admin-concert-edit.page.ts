import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
    FormArray,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Timestamp } from 'firebase/firestore';
import { ArtistsRepository } from '../../../../data-access/artists.repository';
import { ConcertsRepository } from '../../../../data-access/concerts.repository';
import { VenuesRepository } from '../../../../data-access/venues.repository';
import { Artist } from '../../../../models/artist.model';
import { Concert } from '../../../../models/concert.model';
import { Venue } from '../../../../models/venue.model';
import { concertTimeOrderValidator } from '../../../../core/validators/concert-time.validator';
import { TextEditor } from '../../../../shared/text-editor/text-editor';

type ArtistEntryForm = FormGroup<{
    artistId: FormControl<string>;
    featured: FormControl<boolean>;
    sortOrder: FormControl<number>;
}>;

type ConcertForm = FormGroup<{
    date: FormControl<string>;
    startTime: FormControl<string>;
    endTime: FormControl<string>;
    venueId: FormControl<string>;
    description: FormControl<string>;
    status: FormControl<'draft' | 'published'>;
    artistEntries: FormArray<ArtistEntryForm>;
}>;

@Component({
    selector: 'app-admin-concert-edit-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, TextEditor],
    templateUrl: './admin-concert-edit.page..html',
    styleUrls: ['./admin-concert-edit.page.scss']


})
export class AdminConcertEditPage {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly concertsRepository = inject(ConcertsRepository);
    private readonly artistsRepository = inject(ArtistsRepository);
    private readonly venuesRepository = inject(VenuesRepository);

    readonly loading = signal(true);
    readonly saving = signal(false);
    readonly error = signal('');
    readonly success = signal('');
    readonly artistError = signal('');
    readonly concertId = signal<string | null>(null);

    readonly artists = signal<Artist[]>([]);
    readonly venues = signal<Venue[]>([]);

    private currentConcert: Concert | null = null;

    readonly pageTitle = computed(() =>
        this.concertId() ? 'Edit concert' : 'Create concert',
    );

    readonly form: ConcertForm = new FormGroup(
        {
            date: new FormControl('', {
                nonNullable: true,
                validators: [Validators.required],
            }),
            startTime: new FormControl('', {
                nonNullable: true,
                validators: [Validators.required],
            }),
            endTime: new FormControl('', {
                nonNullable: true,
                validators: [Validators.required],
            }),
            venueId: new FormControl('', {
                nonNullable: true,
                validators: [Validators.required],
            }),
            description: new FormControl('', {
                nonNullable: true,
                validators: [],
            }),
            status: new FormControl<'draft' | 'published'>('published', {
                nonNullable: true,
                validators: [Validators.required],
            }),
            artistEntries: new FormArray<ArtistEntryForm>([]),
        },
        { validators: [concertTimeOrderValidator()] },
    );

    constructor() {
        void this.init();
    }

    get artistEntries(): FormArray<ArtistEntryForm> {
        return this.form.controls.artistEntries;
    }

    private createArtistEntryForm(
        artistId = '',
        featured = false,
        sortOrder = this.artistEntries.length + 1,
    ): ArtistEntryForm {
        return new FormGroup({
            artistId: new FormControl(artistId, {
                nonNullable: true,
                validators: [Validators.required],
            }),
            featured: new FormControl(featured, {
                nonNullable: true,
            }),
            sortOrder: new FormControl(sortOrder, {
                nonNullable: true,
                validators: [Validators.required],
            }),
        });
    }

    addArtistEntry(): void {
        this.artistEntries.push(this.createArtistEntryForm());
        this.syncSortOrders();
        this.artistError.set('');
    }

    removeArtistEntry(index: number): void {
        this.artistEntries.removeAt(index);
        this.syncSortOrders();
        this.artistError.set('');
    }

    moveArtistUp(index: number): void {
        if (index <= 0) return;

        const current = this.artistEntries.at(index);
        const previous = this.artistEntries.at(index - 1);

        this.artistEntries.setControl(index - 1, current);
        this.artistEntries.setControl(index, previous);
        this.syncSortOrders();
    }

    moveArtistDown(index: number): void {
        if (index >= this.artistEntries.length - 1) return;

        const current = this.artistEntries.at(index);
        const next = this.artistEntries.at(index + 1);

        this.artistEntries.setControl(index + 1, current);
        this.artistEntries.setControl(index, next);
        this.syncSortOrders();
    }

    private syncSortOrders(): void {
        this.artistEntries.controls.forEach((entry, index) => {
            entry.controls.sortOrder.setValue(index + 1);
        });
    }

    private async init(): Promise<void> {
        try {
            const [artists, venues] = await Promise.all([
                this.artistsRepository.getAll(),
                this.venuesRepository.getAll(),
            ]);

            this.artists.set(artists);
            this.venues.set(venues);

            const id = this.route.snapshot.paramMap.get('id');
            this.concertId.set(id);

            if (!id) {
                this.loading.set(false);
                return;
            }

            const concert = await this.concertsRepository.getById(id);

            if (!concert) {
                this.error.set('Concert not found.');
                this.loading.set(false);
                return;
            }

            this.currentConcert = concert;

            const start = concert.startAt.toDate();
            const end = concert.endAt.toDate();

            this.form.controls.date.setValue(this.toDateInputValue(start));
            this.form.controls.startTime.setValue(this.toTimeInputValue(start));
            this.form.controls.endTime.setValue(this.toTimeInputValue(end));
            this.form.controls.venueId.setValue(concert.venueId);
            this.form.controls.description.setValue(concert.description);
            this.form.controls.status.setValue(concert.status);

            this.artistEntries.clear();

            [...concert.artistEntries]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .forEach((entry) => {
                    this.artistEntries.push(
                        this.createArtistEntryForm(entry.artistId, entry.featured, entry.sortOrder),
                    );
                });

            this.syncSortOrders();
        } catch (error) {
            console.error(error);
            this.error.set('Failed to load concert.');
        } finally {
            this.loading.set(false);
        }
    }

    async save(): Promise<void> {
        this.form.markAllAsTouched();
        this.artistError.set('');

        if (this.form.invalid) {
            return;
        }

        if (this.artistEntries.length === 0) {
            this.artistError.set('At least one artist is required.');
            return;
        }

        const rawArtistEntries = this.artistEntries.getRawValue();

        const artistIds = rawArtistEntries.map((entry) => entry.artistId.trim());

        if (artistIds.some((id) => !id)) {
            this.artistError.set('Each artist row must have an artist selected.');
            return;
        }

        if (new Set(artistIds).size !== artistIds.length) {
            this.artistError.set('The same artist cannot be added twice to one concert.');
            return;
        }

        this.saving.set(true);
        this.error.set('');
        this.success.set('');

        try {
            const raw = this.form.getRawValue();

            const startAt = Timestamp.fromDate(
                new Date(`${raw.date}T${raw.startTime}`),
            );

            const endAt = Timestamp.fromDate(
                new Date(`${raw.date}T${raw.endTime}`),
            );

            const normalizedArtistEntries = raw.artistEntries.map((entry, index) => ({
                artistId: entry.artistId,
                featured: entry.featured,
                sortOrder: index + 1,
            }));

            const payload = {
                startAt,
                endAt,
                venueId: raw.venueId,
                description: raw.description.trim(),
                artistEntries: normalizedArtistEntries,
                artistIds: normalizedArtistEntries.map((entry) => entry.artistId),
                status: raw.status,
            };

            if (!this.concertId()) {
                const newConcertId = await this.concertsRepository.create(payload);
                await this.router.navigateByUrl(`/admin/concerts/${newConcertId}`);
                return;
            }

            const existingId = this.concertId()!;
            await this.concertsRepository.update(existingId, payload);

            this.success.set('Concert saved successfully.');
            this.currentConcert = await this.concertsRepository.getById(existingId);
        } catch (error) {
            console.error(error);
            this.error.set('Failed to save concert.');
        } finally {
            this.saving.set(false);
        }
    }

    private toDateInputValue(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private toTimeInputValue(date: Date): string {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
}
