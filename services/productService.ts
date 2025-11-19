import { Product, ProductCategory } from '../types';

// Product Management Service
// Handles product CRUD operations and categorization with multi-store support

interface ProductServiceInterface {
  // Products
  getProducts(storeId: string): Promise<Product[]>;
  getProduct(storeId: string, productId: string): Promise<Product | null>;
  createProduct(storeId: string, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  updateProduct(storeId: string, productId: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(storeId: string, productId: string): Promise<void>;
  searchProducts(storeId: string, query: string): Promise<Product[]>;
  getProductBySku(storeId: string, sku: string): Promise<Product | null>;

  // Categories
  getCategories(storeId: string): Promise<ProductCategory[]>;
  createCategory(storeId: string, category: Omit<ProductCategory, 'id' | 'createdAt'>): Promise<ProductCategory>;
  updateCategory(storeId: string, categoryId: string, updates: Partial<ProductCategory>): Promise<ProductCategory>;
  deleteCategory(storeId: string, categoryId: string): Promise<void>;
}

export const productService: ProductServiceInterface = {
  // ==================== PRODUCTS ====================

  async getProducts(storeId: string) {
    // TODO: Implement API call
    // GET /api/stores/:storeId/products
    const key = `products_${storeId}`;
    const stored = localStorage.getItem(key);
    const list: Product[] = stored ? JSON.parse(stored) : [];

    // Normalize IDs to avoid duplicate React keys from older data
    const seen = new Set<string>();
    let changed = false;
    const normalized = list.map((product: Product) => {
      let id = product.id;
      if (!id || seen.has(id)) {
        const fallbackId =
          (globalThis.crypto?.randomUUID?.() as string | undefined) ??
          `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        id = fallbackId;
        changed = true;
      }
      seen.add(id);
      return {
        ...product,
        id,
        stock: (product as any).itemType === 'service' ? Infinity : product.stock,
      };
    });

    if (changed) {
      localStorage.setItem(key, JSON.stringify(normalized));
    }

    return normalized;
  },

  async getProduct(storeId: string, productId: string) {
    // TODO: Implement API call
    // GET /api/stores/:storeId/products/:id
    const products = await this.getProducts(storeId);
    return products.find((p: Product) => p.id === productId) || null;
  },

  async createProduct(storeId: string, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    // TODO: Implement API call
    // POST /api/stores/:storeId/products
    const id =
      (globalThis.crypto?.randomUUID?.() as string | undefined) ??
      `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const newProduct: Product = {
      ...product,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      stock: (product as any).itemType === 'service' ? Infinity : product.stock,
    };
    const products = await this.getProducts(storeId);
    const updated = [...products, newProduct];
    localStorage.setItem(`products_${storeId}`, JSON.stringify(updated));
    return newProduct;
  },

  async updateProduct(storeId: string, productId: string, updates: Partial<Product>) {
    // TODO: Implement API call
    // PUT /api/stores/:storeId/products/:id
    const products = await this.getProducts(storeId);
    const index = products.findIndex((p: Product) => p.id === productId);
    if (index === -1) throw new Error('Product not found');
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date(),
      stock:
        ((updates as any).itemType === 'service' || (products[index] as any).itemType === 'service')
          ? Infinity
          : updates.stock ?? products[index].stock,
    };
    localStorage.setItem(`products_${storeId}`, JSON.stringify(products));
    return products[index];
  },

  async deleteProduct(storeId: string, productId: string) {
    // TODO: Implement API call
    // DELETE /api/stores/:storeId/products/:id
    const products = await this.getProducts(storeId);
    const filtered = products.filter((p: Product) => p.id !== productId);
    localStorage.setItem(`products_${storeId}`, JSON.stringify(filtered));
  },

  async searchProducts(storeId: string, query: string) {
    // TODO: Implement API call with search parameters
    // GET /api/stores/:storeId/products/search?q=...
    const products = await this.getProducts(storeId);
    const lowerQuery = query.toLowerCase();
    return products.filter((p: Product) => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.sku.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );
  },

  async getProductBySku(storeId: string, sku: string) {
    // TODO: Implement API call
    // GET /api/stores/:storeId/products/sku/:sku
    const products = await this.getProducts(storeId);
    return products.find((p: Product) => p.sku === sku) || null;
  },

  // ==================== CATEGORIES ====================

  async getCategories(storeId: string) {
    // TODO: Implement API call
    // GET /api/stores/:storeId/categories
    const key = `categories_${storeId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  },

  async createCategory(storeId: string, category: Omit<ProductCategory, 'id' | 'createdAt'>) {
    // TODO: Implement API call
    // POST /api/stores/:storeId/categories
    const newCategory: ProductCategory = {
      ...category,
      id: `cat_${Date.now()}`,
      createdAt: new Date(),
    };
    const categories = await this.getCategories(storeId);
    const updated = [...categories, newCategory];
    localStorage.setItem(`categories_${storeId}`, JSON.stringify(updated));
    return newCategory;
  },

  async updateCategory(storeId: string, categoryId: string, updates: Partial<ProductCategory>) {
    // TODO: Implement API call
    // PUT /api/stores/:storeId/categories/:id
    const categories = await this.getCategories(storeId);
    const index = categories.findIndex((c: ProductCategory) => c.id === categoryId);
    if (index === -1) throw new Error('Category not found');
    categories[index] = { ...categories[index], ...updates };
    localStorage.setItem(`categories_${storeId}`, JSON.stringify(categories));
    return categories[index];
  },

  async deleteCategory(storeId: string, categoryId: string) {
    // TODO: Implement API call
    // DELETE /api/stores/:storeId/categories/:id
    const categories = await this.getCategories(storeId);
    const filtered = categories.filter((c: ProductCategory) => c.id !== categoryId);
    localStorage.setItem(`categories_${storeId}`, JSON.stringify(filtered));
  },
};
