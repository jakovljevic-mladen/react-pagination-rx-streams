import React, {useMemo, useRef} from 'react';
import {getRandomFeedDataObservable} from '../faker';
import {catchError, defer, EMPTY, exhaustMap, filter, from, map, mergeAll, scan, startWith, switchMap, tap} from 'rxjs';
import {useObservedValue} from '../hooks/observable';
import {FeedItem} from '../models';
import classes from './FeedComponent.module.css';
import {fromMutationObserver} from '../fromMutationObserver';
import {fromIntersectionObserver} from '../fromIntersectionObserver';

function FeedComponent() {
  const nextPageRef = useRef<number | null>(1);
  const articlesDiv = useRef(null);

  const loadMore$ = useMemo(() => defer(() => fromMutationObserver(articlesDiv.current!, {
    childList: true,
    subtree: true
  }).pipe(
    map(([record]) => (record.target as HTMLElement).tagName === 'DIV'
      ? Array.from(record.target.childNodes)
      : record.target.parentElement?.tagName === 'DIV'
        ? Array.from(record.target.parentElement.childNodes)
        : []), // select all <article> tags
    map(elements => elements.splice(-3)), // take the last 3 <article> tags
    switchMap(elements => from(elements.map(el => fromIntersectionObserver(el as Element))).pipe(mergeAll())),
    filter(({isIntersecting}) => isIntersecting),
    startWith(null)
  )), []);

  const feed$ = useMemo(() => loadMore$.pipe(
    exhaustMap(() => nextPageRef.current
      ? getRandomFeedDataObservable({nextPage: nextPageRef.current}).pipe(
        catchError(() => EMPTY),
        tap({
          next: ({nextPage}) => nextPageRef.current = nextPage
        })
      )
      : EMPTY),
    scan((acc, {items}) => acc.concat(items), [] as FeedItem[])), [loadMore$]);

  const feedItems = useObservedValue<FeedItem[]>(feed$, []);

  return (
    <>
      <div className={classes.articles} ref={articlesDiv}>
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
