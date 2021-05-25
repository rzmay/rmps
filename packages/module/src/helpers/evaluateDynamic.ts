import Curve from 'curves';
import { dynamicValue } from '../types/dynamicValue';

export default function evaluateDynamic<T>(
  value: dynamicValue<T>,
  // eslint-disable-next-line no-unused-vars
  interpolate: (a: T, b: T, t: number) => T,
  time: number = 0,
): T {
  if (value instanceof Curve) {
    return (value as Curve<T>).evaluate(time);
  } if ('min' in value && 'max' in value) {
    const min: T = evaluateDynamic(value.min, interpolate, time);
    const max: T = evaluateDynamic(value.max, interpolate, time);

    return interpolate(min, max, Math.random());
  }
  return value;
}
