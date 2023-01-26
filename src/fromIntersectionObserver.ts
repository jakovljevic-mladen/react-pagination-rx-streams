import {Observable} from 'rxjs';

export function fromIntersectionObserver(target: Element, options?: IntersectionObserverInit): Observable<IntersectionObserverEntry> {
  return new Observable(subscriber => {
    const callback = ([entry]: IntersectionObserverEntry[]) => subscriber.next(entry);

    const io = new IntersectionObserver(callback, options);

    io.observe(target);

    return () => io.disconnect();
  });
}
