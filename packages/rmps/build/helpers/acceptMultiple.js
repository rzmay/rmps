export default function acceptMultiple(param) {
    if (!param)
        return;
    const arr = [];
    return arr.concat(param).filter((e) => e != null);
}
