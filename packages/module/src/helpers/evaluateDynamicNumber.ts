import { dynamicValue } from '../types/dynamicValue';
import evaluateDynamic from './evaluateDynamic';

export default function evaluateDynamicNumber(
  value: dynamicValue<number> = 0,
  time = 0,
): number {
  return evaluateDynamic<number>(
    value,
    (a, b, t) => (a + (b - a) * t),
    time,
  );
}
