import { Timestamp } from 'firebase/firestore';

export interface Artist {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  imagePath: string;
  instruments: string[];
  bios: {
    nl: string;
    en: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
