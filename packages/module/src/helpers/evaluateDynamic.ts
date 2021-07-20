import { dynamicValue } from '../types/dynamicValue';

export default function evaluateDynamic<T>(
  value: dynamicValue<T>,
  interpolate: (a: T, b: T, t: number) => T,
  time = 0,
): T {
  if (typeof value === 'function') {
    return (value as ((t: number) => T))(time);
  } if (Object.keys(value).includes('dynamicRange') && 'min' in value && 'max' in value) {
    const min: T = evaluateDynamic(value.min, interpolate, time);
    const max: T = evaluateDynamic(value.max, interpolate, time);

    return interpolate(min, max, Math.random());
  }
  return value as T;
}
