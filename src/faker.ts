import { faker } from '@faker-js/faker';
import { FakeFeedResponse, FeedFilterType, FeedItem } from './models';
import { delay, of, concat, timer, throwError, ignoreElements } from 'rxjs';

type Params = {
  nextPage?: number | null;
  feedFilter?: FeedFilterType;
};

export const getRandomFeedDataObservable = (params?: Params) => {
  const nextPage = params?.nextPage ?? 1;

  if (nextPage > 2 && Math.random() < 0.2) {
    return concat(
      timer(1_000).pipe(ignoreElements()),
      throwError(() => new Error('Fake error occurred'))
    );
  }

  return of(getRandomData(params)).pipe(delay(300));
};

function getRandomData(params?: Params): FakeFeedResponse {
  const page = params?.nextPage ?? 1;
  const feedFilter = params?.feedFilter ?? '';

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
