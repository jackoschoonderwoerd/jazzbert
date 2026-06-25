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
import { Venue } from '../models/venue.model';

export type VenueCreateInput = Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>;
export type VenueUpdateInput = Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>;

@Injectable({ providedIn: 'root' })
export class VenuesRepository {
    private readonly collectionRef = collection(db, 'jazzbert-venues');

    async getAll(): Promise<Venue[]> {
        const snap = await getDocs(this.collectionRef);
        return snap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Venue, 'id'>),
        }));
    }

    async getById(id: string): Promise<Venue | null> {
        const ref = doc(db, 'jazzbert-venues', id);
        const snap = await getDoc(ref);

        if (!snap.exists()) return null;

        return {
            id: snap.id,
            ...(snap.data() as Omit<Venue, 'id'>),
        };
    }

    async create(input: VenueCreateInput): Promise<string> {
        const created = await addDoc(this.collectionRef, {
            ...input,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return created.id;
    }

    async update(id: string, input: VenueUpdateInput): Promise<void> {
        await setDoc(
            doc(db, 'jazzbert-venues', id),
            {
                ...input,
                updatedAt: serverTimestamp(),
            },
            { merge: true },
        );
    }

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, 'jazzbert-venues', id));
    }
}
