export type FeedFilterType = '' | 'onlyImages' | 'onlyText'; // An empty string because of <option value="">All<...>

export type FakeFeedResponse = {
  page: number;
  nextPage: number | null;
  items: FeedItem[];
} | {
  error?: Error;
}

export interface FeedItem {
  id: string;
  user: {name: string, avatar: string};
  type: 'text' | 'image';
  created: Date;

  text?: string;
  imageURL?: string;
}
