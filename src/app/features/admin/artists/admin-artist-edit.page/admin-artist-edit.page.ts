import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ArtistsRepository } from '../../../../data-access/artists.repository';
import { ArtistImagesRepository } from '../../../../data-access/artist-images.repository';
import { Artist } from '../../../../models/artist.model';
import { slugify } from '../../../../core/utils/slug.util';
import { TextEditor } from '../../../../shared/text-editor/text-editor';

type ArtistForm = FormGroup<{
    name: FormControl<string>;
    instruments: FormControl<string>;
    bioNl: FormControl<string>;
    bioEn: FormControl<string>;
}>;

@Component({
    selector: 'app-admin-artist-edit-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, TextEditor],
    templateUrl: './admin-artist-edit.page.html',
    styleUrls: ['./admin-artist-edit.page.scss']
})
export class AdminArtistEditPage {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly artistsRepository = inject(ArtistsRepository);
    private readonly artistImagesRepository = inject(ArtistImagesRepository);

    readonly loading = signal(true);
    readonly saving = signal(false);
    readonly error = signal('');
    readonly success = signal('');
    readonly artistId = signal<string | null>(null);

    readonly selectedFile = signal<File | null>(null);
    readonly selectedFileName = computed(() => this.selectedFile()?.name ?? '');
    readonly imagePreviewUrl = signal<string | null>(null);

    private currentArtist: Artist | null = null;

    readonly pageTitle = computed(() =>
        this.artistId() ? 'Edit artist' : 'Create artist',
    );

    readonly form: ArtistForm = new FormGroup({
        name: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        instruments: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        bioNl: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        bioEn: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });

    constructor() {
        void this.init();
    }

    private async init(): Promise<void> {
        try {
            const id = this.route.snapshot.paramMap.get('id');
            this.artistId.set(id);

            if (!id) {
                this.loading.set(false);
                return;
            }

            const artist = await this.artistsRepository.getById(id);

            if (!artist) {
                this.error.set('Artist not found.');
                this.loading.set(false);
                return;
            }

            this.currentArtist = artist;

            this.form.setValue({
                name: artist.name,
                instruments: artist.instruments.join(', '),
                bioNl: artist.bios.nl,
                bioEn: artist.bios.en,
            });

            this.imagePreviewUrl.set(artist.imageUrl || null);
        } catch (error) {
            console.error(error);
            this.error.set('Failed to load artist.');
        } finally {
            this.loading.set(false);
        }
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;

        this.selectedFile.set(file);

        if (!file) {
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        this.imagePreviewUrl.set(objectUrl);
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

            const instruments = raw.instruments
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean);

            if (instruments.length === 0) {
                this.error.set('At least one instrument is required.');
                this.saving.set(false);
                return;
            }

            const basePayload = {
                name: raw.name.trim(),
                slug: slugify(raw.name),
                imageUrl: this.currentArtist?.imageUrl ?? '',
                imagePath: this.currentArtist?.imagePath ?? '',
                instruments,
                bios: {
                    nl: raw.bioNl.trim(),
                    en: raw.bioEn.trim(),
                },
            };

            if (!this.artistId()) {
                const newArtistId = await this.artistsRepository.create(basePayload);

                if (this.selectedFile()) {
                    const uploadResult = await this.artistImagesRepository.upload(
                        newArtistId,
                        this.selectedFile()!,
                    );

                    await this.artistsRepository.update(newArtistId, {
                        ...basePayload,
                        imageUrl: uploadResult.imageUrl,
                        imagePath: uploadResult.imagePath,
                    });
                }

                await this.router.navigateByUrl(`/admin/artists/${newArtistId}`);
                return;
            }

            const existingId = this.artistId()!;

            let imageUrl = this.currentArtist?.imageUrl ?? '';
            let imagePath = this.currentArtist?.imagePath ?? '';

            if (this.selectedFile()) {
                if (imagePath) {
                    try {
                        await this.artistImagesRepository.delete(imagePath);
                    } catch (error) {
                        console.warn('Old image could not be deleted.', error);
                    }
                }

                const uploadResult = await this.artistImagesRepository.upload(
                    existingId,
                    this.selectedFile()!,
                );

                imageUrl = uploadResult.imageUrl;
                imagePath = uploadResult.imagePath;
            }

            await this.artistsRepository.update(existingId, {
                ...basePayload,
                imageUrl,
                imagePath,
            });

            this.success.set('Artist saved successfully.');

            const updatedArtist = await this.artistsRepository.getById(existingId);
            this.currentArtist = updatedArtist;
        } catch (error) {
            console.error(error);
            this.error.set('Failed to save artist.');
        } finally {
            this.saving.set(false);
        }
    }
}
