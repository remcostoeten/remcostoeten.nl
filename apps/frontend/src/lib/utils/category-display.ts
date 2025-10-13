import type { TBlogCategory } from '@/lib/blog/types';

type TCategoryInput = string | string[] | TBlogCategory;

/**
 * Normalizes category input to always return an array of strings
 */
export function normalizeCategoriesForDisplay(category: TCategoryInput): string[] {
  if (Array.isArray(category)) {
    return category;
  }
  return [category];
}

/**
 * Gets the primary category (first one) from a category input
 */
export function getPrimaryCategory(category: TCategoryInput): string {
  const categories = normalizeCategoriesForDisplay(category);
  return categories[0] || '';
}

/**
 * Checks if categories contain a specific category
 */
export function hasCategory(categories: TCategoryInput, targetCategory: string): boolean {
  const normalizedCategories = normalizeCategoriesForDisplay(categories);
  return normalizedCategories.includes(targetCategory);
}

/**
 * Formats categories for display (e.g., "Category 1, Category 2")
 */
export function formatCategoriesForDisplay(categories: TCategoryInput, separator: string = ', '): string {
  const normalizedCategories = normalizeCategoriesForDisplay(categories);
  return normalizedCategories.join(separator);
}

/**
 * Gets all categories except the first one
 */
export function getSecondaryCategoriesForDisplay(categories: TCategoryInput): string[] {
  const normalizedCategories = normalizeCategoriesForDisplay(categories);
  return normalizedCategories.slice(1);
}