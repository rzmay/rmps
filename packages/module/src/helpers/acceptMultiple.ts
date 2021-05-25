export default function acceptMultiple<T>(param: T | T[]) {
  const arr: T[] = [];
  return arr.concat(param).filter((e) => e != null);
}
