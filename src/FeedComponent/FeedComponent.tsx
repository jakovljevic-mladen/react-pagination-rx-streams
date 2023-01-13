import React, {useMemo} from 'react';
import {getRandomFeedDataObservable} from '../faker';
import {map} from 'rxjs';
import {useObservedValue} from '../hooks/observable';
import {FeedItem} from '../models';
import classes from './FeedComponent.module.css';

function FeedComponent() {
  const feed$ = useMemo(() => getRandomFeedDataObservable().pipe(
    map(({ items }) => items)
  ), []);

  const feedItems = useObservedValue<FeedItem[]>(feed$, []);

  return (
    <>
      <div className={classes.articles}>
        {feedItems.map((item) => (
          <article id={item.id} key={item.id}>
            <div className={classes.user}>
              <img src={item.user.avatar} alt={item.user.avatar + ' avatar'}/>
              {item.user.name}
            </div>
            {isText(item) && <p>{item.text}</p>}
            {isImage(item) && <img src={item.imageURL} alt={item.imageURL}/>}
          </article>
        ))}
      </div>
    </>
  );
}

export default FeedComponent;

const isText = (item: FeedItem): boolean => item.type === 'text';

const isImage = (item: FeedItem): boolean => item.type === 'image';
