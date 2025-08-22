import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge conditional class names in a Tailwind-safe way.
 *
 * - Uses `clsx` to conditionally join class values (strings, arrays, objects).
 * - Uses `tailwind-merge` to resolve conflicting Tailwind utilities intelligently.
 *
 * Example:
 * ```ts
 * cn("p-2", condition && "bg-red-500", "text-sm")
 * // => "p-2 text-sm bg-red-500"
 * ```
 *
 * @param inputs - One or more class name values (strings, arrays, or objects).
 * @returns A merged string of valid Tailwind classes.
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
