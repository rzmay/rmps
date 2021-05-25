import { Curve } from 'curves';
import DynamicValueType from './enums/DynamicValueType';
declare type betweenValues<T> = {
    from: T;
    to: T;
};
declare abstract class DynamicValue<T> {
    type: DynamicValueType;
    value: T | Curve<T> | betweenValues<DynamicValue<T>>;
    protected constructor(value: T | Curve<T> | betweenValues<DynamicValue<T>>);
    protected abstract evaluateBetween(time?: number): T;
    evaluate(time?: number): T;
}
export default DynamicValue;
