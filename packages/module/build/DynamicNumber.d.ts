import DynamicValue from './abstract/DynamicValue';
declare class DynamicNumber extends DynamicValue<number> {
    protected evaluateBetween(time?: number): number;
}
export default DynamicNumber;
