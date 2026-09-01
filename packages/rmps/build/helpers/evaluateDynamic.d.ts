import { DynamicValue } from '../types/DynamicValue';
export default function evaluateDynamic<T>(value: DynamicValue<T>, interpolate: (a: T, b: T, t: number) => T, time?: number, seed?: string | undefined): T;
