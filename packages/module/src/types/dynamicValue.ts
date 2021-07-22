export type dynamicValue<T> =
    T
    | ((t: number) => dynamicValue<T>)
    | [dynamicValue<T>, dynamicValue<T>];
