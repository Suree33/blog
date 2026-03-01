import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Compose multiple class values into a single class string and resolve conflicting Tailwind utilities.
 *
 * @param inputs - One or more class values (strings, arrays, objects, etc.) to be combined
 * @returns The resulting class string with duplicates and Tailwind utility conflicts merged/resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
