type ConcertFormValue = {
  date: string;
  startTime: string;
  endTime: string;
  venueId: string;
  description: string;
  artistEntries: Array<{
    artistId: string;
    featured: boolean;
    sortOrder: number;
  }>;
  status: 'draft' | 'published';
};
