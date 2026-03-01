import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Normalizes and merges Tailwind CSS class names.
 *
 * Accepts the same inputs as `clsx` and resolves conflicting Tailwind utilities according to `tailwind-merge` rules.
 *
 * @param inputs - Class name values (strings, arrays, objects, etc.) accepted by `clsx`
 * @returns The merged class string with conflicting Tailwind utilities resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
