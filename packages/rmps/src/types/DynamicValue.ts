export type DynamicValue<T> =
    T
    | ((t: number) => DynamicValue<T>)
    | [DynamicValue<T>, DynamicValue<T>]
    | Set<DynamicValue<T>>;

export type dynamicValue<T> = DynamicValue<T>;
