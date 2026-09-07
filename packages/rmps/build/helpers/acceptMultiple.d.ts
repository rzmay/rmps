import { Multiple } from '../types/Multiple';
export default function acceptMultiple<T>(param?: Multiple<T>): NonNullable<T>[] | undefined;
