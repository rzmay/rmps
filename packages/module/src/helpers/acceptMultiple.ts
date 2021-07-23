import { multiple } from '../types/multiple';

export default function acceptMultiple<T>(param: multiple<T>) {
  const arr: T[] = [];
  return arr.concat(param).filter((e) => e != null);
}
