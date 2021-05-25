import Curve from 'curves';
export declare type dynamicValue<T> = T | Curve<T> | {
    min: dynamicValue<T>;
    max: dynamicValue<T>;
};
