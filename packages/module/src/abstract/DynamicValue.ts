import { Curve } from 'curves';
import DynamicValueType from '../enums/DynamicValueType';
import typeGuard from '../helpers/typeGuard';

type betweenValues<T> = { from: T, to: T }

abstract class DynamicValue<T> {
    type: DynamicValueType;

    readonly value: T | Curve<T> | betweenValues<DynamicValue<T>>;

    protected constructor(value: T | Curve<T> | betweenValues<DynamicValue<T>>) {
      this.value = value;

      if (value instanceof Curve) {
        this.type = DynamicValueType.Curve;
      } else if (typeGuard<T>(value)) {
        this.type = DynamicValueType.Constant;
      } else {
        this.type = DynamicValueType.Between;
      }
    }

    // eslint-disable-next-line no-unused-vars
    protected abstract evaluateBetween(time?: number): T;

    evaluate(time: number = 0): T {
      switch (this.type) {
        case DynamicValueType.Curve:
          return (this.value as Curve<T>).evaluate(time);
        case DynamicValueType.Between:
          return this.evaluateBetween(time);
        default:
          return (this.value as T);
      }
    }
}

export default DynamicValue;
