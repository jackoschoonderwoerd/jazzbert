import { Injectable } from '@angular/core';
import { ArtistsRepository } from '../../../data-access/artists.repository';
import { Artist } from '../../../models/artist.model';

@Injectable({ providedIn: 'root' })
export class PublicArtistsService {
    constructor(private readonly artistsRepository: ArtistsRepository) { }

    getArtistById(id: string): Promise<Artist | null> {
        return this.artistsRepository.getById(id);
    }
}
