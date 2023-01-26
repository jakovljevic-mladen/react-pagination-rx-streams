import {faker} from '@faker-js/faker';
import {FakeFeedResponse, FeedFilterType, FeedItem} from './models';
import {delay, of} from 'rxjs';

export const getRandomFeedDataObservable = (params?: any) => of(getRandomData(params)).pipe(delay(300));

function getRandomData(params?: any): FakeFeedResponse {
  const page = +(params?.['nextPage'] ?? 1);
  const feedFilter: FeedFilterType = params?.['feedFilter'] ?? '';

  const items: FeedItem[] = [];

  const maxItemsPerPage = 12;

  for (let i = 0; i < maxItemsPerPage; i++) {
    items.push(getRandomDataItem(((page - 1) * maxItemsPerPage + i).toString(), feedFilter));
  }

  return {
    page,
    nextPage: page <= 5 ? page + 1 : null,
    items
  };
}

function getRandomDataItem(id: string, feedFilter: FeedFilterType): FeedItem {
  const text = feedFilter ? feedFilter === 'onlyText' : faker.datatype.boolean();

  return {
    id,
    user: {
      name: faker.name.firstName() + ' ' + faker.name.lastName(),
      avatar: faker.image.avatar()
    },
    type: text ? 'text' : 'image',
    created: faker.date.past(),
    text: text ? faker.lorem.sentences(5) : undefined,
    imageURL: text ? undefined : faker.image.image()
  };
}
