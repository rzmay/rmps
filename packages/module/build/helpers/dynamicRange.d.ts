import { dynamicValue } from '../types/dynamicValue';
export default function dynamicRange<T>(min: dynamicValue<T>, max: dynamicValue<T>): {
    min: dynamicValue<T>;
    max: dynamicValue<T>;
    dynamicRange: boolean;
};
