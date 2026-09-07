export default function tagsIntersect(a, b) {
    const intersection = new Set(a).intersection(new Set(b));
    return intersection.size !== 0;
}
