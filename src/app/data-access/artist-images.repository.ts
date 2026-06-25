import { Injectable } from '@angular/core';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../core/firebase/firebase';

@Injectable({ providedIn: 'root' })
export class ArtistImagesRepository {

    async upload(artistId: string, file: File): Promise<{ imageUrl: string; imagePath: string }> {
        const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
        const safeExtension = extension?.toLowerCase() || 'jpg';
        const imagePath = `jazzbert-artist-images/${artistId}/profile.${safeExtension}`;
        const storageRef = ref(storage, imagePath);

        console.log(imagePath)
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);

        return { imageUrl, imagePath };
    }

    async delete(imagePath: string): Promise<void> {
        await deleteObject(ref(storage, imagePath));
    }
}



