export default function typeGuard<T>(o: any): boolean {
  function exclusive(arg: T): boolean {
    return true;
  }

  try {
    return exclusive(o);
  } catch {
    return false;
  }
}
