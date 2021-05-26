import { dynamicValue } from '../types/dynamicValue';
export default function evaluateDynamic<T>(value: dynamicValue<T>, interpolate: (a: T, b: T, t: number) => T, time?: number): T;
