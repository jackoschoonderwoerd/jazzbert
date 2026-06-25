import { ConcertArtistEntry } from "./concert-artist-entry.model";
import { Timestamp } from 'firebase/firestore';


export type ConcertStatus = 'draft' | 'published';

export interface Concert {
  id: string;
  startAt: Timestamp;
  endAt: Timestamp;
  venueId: string;
  description: string;
  artistEntries: ConcertArtistEntry[];
  artistIds: string[];
  status: ConcertStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
