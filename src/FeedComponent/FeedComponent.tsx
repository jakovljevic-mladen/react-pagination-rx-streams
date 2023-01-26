import React, {ChangeEvent, useMemo, useRef, useState} from 'react';
import {getRandomFeedDataObservable} from '../faker';
import {BehaviorSubject, catchError, defer, EMPTY, exhaustMap, filter, from, map, mergeAll, scan, startWith, switchMap, tap} from 'rxjs';
import {useObservedValue, useReactiveCallback} from '../hooks/observable';
import {FeedFilterType, FeedItem} from '../models';
import classes from './FeedComponent.module.css';
import {fromMutationObserver} from '../fromMutationObserver';
import {fromIntersectionObserver} from '../fromIntersectionObserver';

function FeedComponent() {
  const [loading, setLoading] = useState(true);
  const nextPageRef = useRef<number | null>(1);
  const articlesDiv = useRef(null);

  const [filterChange$, filterChangeCallback] = useReactiveCallback<ChangeEvent<HTMLSelectElement>, FeedFilterType>({
    selector: ev => ev.target.value as FeedFilterType,
    connector: () => new BehaviorSubject('' as FeedFilterType)
  });

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

  const feed$ = useMemo(() => filterChange$.pipe(
      switchMap(feedFilter => {
        nextPageRef.current = 1;
        return loadMore$.pipe(
          exhaustMap(() => nextPageRef.current
            ? getRandomFeedDataObservable({nextPage: nextPageRef.current, feedFilter}).pipe(
              catchError(() => EMPTY),
              tap({
                subscribe: () => setLoading(true),
                next: ({nextPage}) => nextPageRef.current = nextPage,
                finalize: () => setLoading(false)
              })
            )
            : EMPTY)
        );
      }),
      scan((acc, {items, page}) => page === 1 ? items : acc.concat(items), [] as FeedItem[])),
    [filterChange$, loadMore$]);

  const feedItems = useObservedValue<FeedItem[]>(feed$, []);

  return (
    <>
      {loading && <div className={classes.loading}>
        Loading...
      </div>}
      <div className={classes.filter}>
        <form>
          <label>
            Feed options
            <select name="feedFilter" onChange={filterChangeCallback}>
              <option value="">All</option>
              <option value="onlyImages">Only Images</option>
              <option value="onlyText">Only Text</option>
            </select>
          </label>
        </form>
      </div>
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
