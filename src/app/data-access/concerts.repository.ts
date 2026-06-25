import { Injectable } from '@angular/core';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    where,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../core/firebase/firebase';
import { Concert } from '../models/concert.model';

export type ConcertCreateInput = Omit<Concert, 'id' | 'createdAt' | 'updatedAt'>;
export type ConcertUpdateInput = Omit<Concert, 'id' | 'createdAt' | 'updatedAt'>;

@Injectable({ providedIn: 'root' })
export class ConcertsRepository {
    private readonly collectionRef = collection(db, 'jazzbert-concerts');

    async getAll(): Promise<Concert[]> {
        const snap = await getDocs(this.collectionRef);
        return snap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Concert, 'id'>),
        }));
    }

    async getUpcomingPublished(now: Date): Promise<Concert[]> {
        const concertsQuery = query(
            this.collectionRef,
            where('status', '==', 'published'),
            where('startAt', '>=', Timestamp.fromDate(now)),
            orderBy('startAt', 'asc'),
        );

        const snap = await getDocs(concertsQuery);

        return snap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Concert, 'id'>),
        }));
    }

    async getById(id: string): Promise<Concert | null> {
        const snap = await getDoc(doc(db, 'jazzbert-concerts', id));

        if (!snap.exists()) return null;

        return {
            id: snap.id,
            ...(snap.data() as Omit<Concert, 'id'>),
        };
    }

    async create(input: ConcertCreateInput): Promise<string> {
        const created = await addDoc(this.collectionRef, {
            ...input,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return created.id;
    }

    async update(id: string, input: ConcertUpdateInput): Promise<void> {
        await setDoc(
            doc(db, 'jazzbert-concerts', id),
            {
                ...input,
                updatedAt: serverTimestamp(),
            },
            { merge: true },
        );
    }

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, 'jazzbert-concerts', id));
    }
}
