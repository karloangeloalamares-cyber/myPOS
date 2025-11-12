import { Product } from './types';

// Default store ID for single-store implementations
const DEFAULT_STORE_ID = 'store_default';

// Category IDs placeholder (kept for compatibility if referenced)
const CATEGORIES = {
  appetizers: 'cat_appetizers',
  mainCourses: 'cat_main_courses',
  desserts: 'cat_desserts',
  drinks: 'cat_drinks',
};

// Start with no test/demo products by default
export const RESTAURANT_MENU: Product[] = [];

