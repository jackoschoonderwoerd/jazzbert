import { Timestamp } from 'firebase/firestore'

export interface Visit {
    id: string;
    path: string;
    userAgent: string,
    visitedAt: Timestamp,
}
