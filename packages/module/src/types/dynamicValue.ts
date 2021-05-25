import Curve from 'curves';

export type dynamicValue<T> = T | Curve<T> | { min: dynamicValue<T>, max: dynamicValue<T> };
