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
    increment
} from 'firebase/firestore';
import { db } from '../core/firebase/firebase';
import { Visit } from '../models/visit-model';



@Injectable({ providedIn: 'root' })
export class VisitsRepository {
    private readonly collectionRef = collection(db, 'jazzbert-visits')

    async getAll(): Promise<Visit[]> {
        console.log('getAll()')
        const snap = await getDocs(this.collectionRef)
        return snap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Visit, 'id'>)
        }));
    }


    async addVisit() {
        const ref = collection(db, 'jazzbert-visits/');
        console.log('addVisit()')

        await addDoc(ref, {
            visitedAt: serverTimestamp(),
            userAgent: navigator.userAgent,
            path: window.location.pathname,
        });
    }
    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, 'jazzbert-visits', id));
    }
}
