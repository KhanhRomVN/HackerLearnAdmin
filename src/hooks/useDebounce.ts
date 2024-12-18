import { useCallback } from 'react';
import debounce from 'lodash/debounce';

export const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  return useCallback(
    debounce((...args: any[]) => callback(...args), delay),
    [callback, delay]
  );
};