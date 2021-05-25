import DynamicValue from './abstract/DynamicValue';
import { betweenValues } from './helpers/betweenValues';

class DynamicNumber extends DynamicValue<number> {
  protected evaluateBetween(time?: number): number {
    const value = this.value as betweenValues<DynamicValue<number>>;
    const from = value.from.evaluate(time);
    const to = value.to.evaluate(time);

    return (from + (to - from) * Math.random());
  }
}

export default DynamicNumber;
