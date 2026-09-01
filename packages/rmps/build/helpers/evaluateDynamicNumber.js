import evaluateDynamic from './evaluateDynamic';
export default function evaluateDynamicNumber(value = 0, time = 0, seed = undefined) {
    return evaluateDynamic(value, (a, b, t) => (a + (b - a) * t), time, seed);
}
