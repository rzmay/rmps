import { dynamicValue } from '../types/dynamicValue';

export default function evaluateDynamic<T>(
  value: dynamicValue<T>,
  interpolate: (a: T, b: T, t: number) => T,
  time = 0,
): T {
  if (typeof value === 'function') {
    return evaluateDynamic((value as ((t: number) => T))(time), interpolate, time);
  } if (Array.isArray(value)) {
    const min: T = evaluateDynamic(value[0], interpolate, time);
    const max: T = evaluateDynamic(value[1], interpolate, time);

    return interpolate(min, max, Math.random());
  }
  return value as T;
}
