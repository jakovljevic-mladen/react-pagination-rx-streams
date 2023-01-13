export interface FakeFeedResponse {
  page: number;
  nextPage: number | null;
  items: FeedItem[];
}

export interface FeedItem {
  id: string;
  user: { name: string, avatar: string };
  type: 'text' | 'image';
  created: Date;

  text?: string;
  imageURL?: string;
}
