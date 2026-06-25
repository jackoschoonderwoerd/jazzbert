export interface ConcertArtistView {

    id: string;
    name: string;
    // 001 add instruments array
    instruments: string[];
    slug: string;
    featured: boolean;
    sortOrder: number;
}

export interface ConcertVenueView {
    id: string;
    name: string;
    address: string;
    homepageUrl: string;
    locationIframe: string;
    socialLinks: {
        instagram?: string;
        facebook?: string;
    };
}

export interface ConcertView {
    id: string;
    startAt: Date;
    endAt: Date;
    description: string;
    status: 'draft' | 'published';
    venue: ConcertVenueView | null;
    artists: ConcertArtistView[];
}

// import { Venue } from "./venue.model";

// export interface ConcertView {
//   id: string;
//   startAt: Date;
//   endAt: Date;
//   description: string;
//   venue: Pick<Venue, 'id' | 'name' | 'address' | 'homepageUrl' | 'socialLinks'>;
//   artists: Array<{
//     id: string;
//     name: string;
//     slug: string;
//     featured: boolean;
//     sortOrder: number;
//   }>;
// }
