import {Observable} from 'rxjs';
import {useEffect, useState} from 'react';

export function useObservedValue<T>(obs$: Observable<T>, defaultValue: T): T {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const sub = obs$.subscribe(setValue);

    return () => sub.unsubscribe();
  }, [obs$]);

  return value;
}
