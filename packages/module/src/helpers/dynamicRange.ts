import { dynamicValue } from '../types/dynamicValue';

export default function dynamicRange<T>(min: dynamicValue<T>, max: dynamicValue<T>) { return { min, max, dynamicRange: true }; }
