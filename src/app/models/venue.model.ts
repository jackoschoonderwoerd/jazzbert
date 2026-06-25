import { Timestamp } from 'firebase/firestore';

export interface Venue {
    id: string;
    name: string;
    slug: string;
    address: string;
    homepageUrl: string;
    locationIframe: string;
    socialLinks: {
        instagram?: string;
        facebook?: string;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
