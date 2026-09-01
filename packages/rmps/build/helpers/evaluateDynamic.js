import seedrandom from 'seedrandom';
export default function evaluateDynamic(value, interpolate, time = 0, seed = undefined) {
    if (typeof value === 'function') {
        return evaluateDynamic(value(time), interpolate, time, seed);
    }
    else if (Array.isArray(value)) {
        const interpTime = seed == undefined ? Math.random() : seedrandom(seed).quick();
        const min = evaluateDynamic(value[0], interpolate, time, seed);
        const max = evaluateDynamic(value[1], interpolate, time, seed);
        return interpolate(min, max, interpTime);
    }
    else if (value instanceof Set) {
        const indexSelector = seed == undefined ? Math.random() : seedrandom(seed).quick();
        const item = Array.from(value)[Math.floor(value.size * indexSelector)];
        return evaluateDynamic(item, interpolate, time, seed);
    }
    return value;
}
