/**
 * @name slugify
 * @description Converts a string into a URL-friendly slug. Used for generating anchor IDs from heading text.
 */
export function slugify(str: string): string {
    return str
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/&/g, '-and-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
}

