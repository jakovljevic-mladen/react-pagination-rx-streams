import {Observable} from 'rxjs';

export function fromMutationObserver(target: Element, options?: MutationObserverInit): Observable<MutationRecord[]> {
  return new Observable(subscriber => {
    const cb = (mutations: MutationRecord[]) => subscriber.next(mutations);

    const mo = new MutationObserver(cb);

    mo.observe(target, options);

    return () => mo.disconnect();
  });
}
