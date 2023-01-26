import {Observable, Subject} from 'rxjs';
import {useCallback, useEffect, useMemo, useState} from 'react';

export function useObservedValue<T>(obs$: Observable<T>, defaultValue: T): T {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const sub = obs$.subscribe(setValue);

    return () => sub.unsubscribe();
  }, [obs$]);

  return value;
}

export function useReactiveCallback<V, R>(config: {
  selector: (value: V) => R;
  connector?: () => Subject<R>;
}): [Observable<R>, (value: V) => void];

export function useReactiveCallback<V>(config?: {
  selector?: undefined;
  connector?: () => Subject<V>;
}): [Observable<V>, (value: V) => void];

export function useReactiveCallback<V, R>(config?: {
  selector?: (value: V) => R;
  connector?: () => Subject<V | R>;
}): [Observable<V | R>, (value: V) => void] {
  const {selector, connector = () => new Subject()} = config ?? {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const subject = useMemo(connector, []);

  const callback = useCallback(
    (value: V) => {
      if (selector) {
        let result: R;
        try {
          result = selector(value);
        } catch (err: any) {
          subject.error(err);
          return;
        }
        subject.next(result);
      } else {
        subject.next(value);
      }
    },
    [subject, selector]
  );
  const observable = useMemo(() => subject.asObservable(), [subject]);

  return [observable, callback];
}
