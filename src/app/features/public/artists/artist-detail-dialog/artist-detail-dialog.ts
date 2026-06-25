import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PublicArtistsService } from '../public-artists.service';
import { Artist } from '../../../../models/artist.model';

@Component({
    selector: 'app-artist-detail-dialog',
    imports: [MatDialogModule, MatIconModule, MatButtonModule,],
    templateUrl: './artist-detail-dialog.html',
    styleUrl: './artist-detail-dialog.scss',
})
export class ArtistDetailDialog {
    data = inject(MAT_DIALOG_DATA);
    publicArtistsService = inject(PublicArtistsService);
    readonly artist = signal<Artist | null>(null);
    readonly loading = signal(true);

    constructor() {
        this.loadArtist()
    }

    private async loadArtist() {
        console.log(this.data.id)
        try {


            const artist = await this.publicArtistsService.getArtistById(this.data.id);
            this.artist.set(artist);
        } catch (error) {
            console.error(error);
        } finally {
            this.loading.set(false);
        }
    }
}
