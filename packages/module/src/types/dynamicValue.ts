export type dynamicValue<T> = T | ((t: number) => T) | { min: dynamicValue<T>, max: dynamicValue<T>, dynamicRange: boolean };
