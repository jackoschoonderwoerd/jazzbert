import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { VenuesRepository } from '../../../../data-access/venues.repository';
import { Venue } from '../../../../models/venue.model';
import { slugify } from '../../../../core/utils/slug.util';
import { optionalUrlValidator } from '../../../../core/validators/url.validator';

type VenueForm = FormGroup<{
    name: FormControl<string>;
    address: FormControl<string>;
    homepageUrl: FormControl<string>;
    locationIframe: FormControl<string>;
    instagram: FormControl<string>;
    facebook: FormControl<string>;
}>;

@Component({
    selector: 'app-admin-venue-edit-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './admin-venue-edit.page.html',
    styleUrls: ['admin-venue-edit.page.scss'],
})
export class AdminVenueEditPage {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly venuesRepository = inject(VenuesRepository);

    readonly loading = signal(true);
    readonly saving = signal(false);
    readonly error = signal('');
    readonly success = signal('');
    readonly venueId = signal<string | null>(null);

    private currentVenue: Venue | null = null;

    readonly pageTitle = computed(() =>
        this.venueId() ? 'Edit venue' : 'Create venue',
    );

    readonly form: VenueForm = new FormGroup({
        name: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        address: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        homepageUrl: new FormControl('', {
            nonNullable: true,
            validators: [optionalUrlValidator()],
        }),
        locationIframe: new FormControl('', {
            nonNullable: true,
            validators: []
        }),
        instagram: new FormControl('', {
            nonNullable: true,
            validators: [optionalUrlValidator()],
        }),
        facebook: new FormControl('', {
            nonNullable: true,
            validators: [optionalUrlValidator()],
        }),
    });

    constructor() {
        void this.init();
    }

    private async init(): Promise<void> {
        try {
            const id = this.route.snapshot.paramMap.get('id');
            this.venueId.set(id);

            if (!id) {
                this.loading.set(false);
                return;
            }

            const venue = await this.venuesRepository.getById(id);

            if (!venue) {
                this.error.set('Venue not found.');
                this.loading.set(false);
                return;
            }

            this.currentVenue = venue;

            this.form.setValue({
                name: venue.name,
                address: venue.address,
                homepageUrl: venue.homepageUrl ?? '',
                locationIframe: venue.locationIframe ?? '',
                instagram: venue.socialLinks.instagram ?? '',
                facebook: venue.socialLinks.facebook ?? '',
            });
        } catch (error) {
            console.error(error);
            this.error.set('Failed to load venue.');
        } finally {
            this.loading.set(false);
        }
    }

    async save(): Promise<void> {
        this.form.markAllAsTouched();

        if (this.form.invalid) {
            return;
        }

        this.saving.set(true);
        this.error.set('');
        this.success.set('');

        try {
            const raw = this.form.getRawValue();

            const payload = {
                name: raw.name.trim(),
                slug: slugify(raw.name),
                address: raw.address.trim(),
                homepageUrl: raw.homepageUrl.trim(),
                locationIframe: raw.locationIframe.trim(),
                socialLinks: {
                    instagram: raw.instagram.trim() || undefined,
                    facebook: raw.facebook.trim() || undefined,
                },
            };

            if (!this.venueId()) {
                const newVenueId = await this.venuesRepository.create(payload);
                await this.router.navigateByUrl(`/admin/venues/${newVenueId}`);
                return;
            }

            const existingId = this.venueId()!;

            await this.venuesRepository.update(existingId, payload);

            this.success.set('Venue saved successfully.');

            const updatedVenue = await this.venuesRepository.getById(existingId);
            this.currentVenue = updatedVenue;
        } catch (error) {
            console.error(error);
            this.error.set('Failed to save venue.');
        } finally {
            this.saving.set(false);
        }
    }
}
