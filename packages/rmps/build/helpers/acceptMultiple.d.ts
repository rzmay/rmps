import { multiple } from '../types/multiple';
export default function acceptMultiple<T>(param: multiple<T>): NonNullable<T>[];
