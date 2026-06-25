import { Injectable } from '@angular/core';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore';
import { db } from '../core/firebase/firebase';
import { Artist } from '../models/artist.model';

export type ArtistCreateInput = Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>;
export type ArtistUpdateInput = Omit<Artist, 'id' | 'createdAt' | 'updatedAt'>;

@Injectable({ providedIn: 'root' })
export class ArtistsRepository {
    private readonly collectionRef = collection(db, 'jazzbert-artists');

    async getAll(): Promise<Artist[]> {
        const snap = await getDocs(this.collectionRef);
        return snap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Artist, 'id'>),
        }));
    }

    async getById(id: string): Promise<Artist | null> {
        const ref = doc(db, 'jazzbert-artists', id);
        const snap = await getDoc(ref);

        if (!snap.exists()) return null;

        return {
            id: snap.id,
            ...(snap.data() as Omit<Artist, 'id'>),
        };
    }

    async create(input: ArtistCreateInput): Promise<string> {
        const created = await addDoc(this.collectionRef, {
            ...input,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return created.id;
    }

    async update(id: string, input: ArtistUpdateInput): Promise<void> {
        const ref = doc(db, 'jazzbert-artists', id);
        await setDoc(
            ref,
            {
                ...input,
                updatedAt: serverTimestamp(),
            },
            { merge: true },
        );
    }

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, 'jazzbert-artists', id));
    }
}
