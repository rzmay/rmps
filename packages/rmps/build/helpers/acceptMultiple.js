export default function acceptMultiple(param) {
    const arr = [];
    return arr.concat(param).filter((e) => e != null);
}
