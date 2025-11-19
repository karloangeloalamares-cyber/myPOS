export interface StockAwareItem {
  stock: number;
  itemType?: string | null;
}

const normalizeItemType = (item: StockAwareItem) => String(item.itemType ?? '').toLowerCase();

export const isServiceItem = (item: StockAwareItem) =>
  normalizeItemType(item) === 'service';

/** Products/services that should obey stock counts */
export const isStockTrackedItem = (item: StockAwareItem) =>
  !isServiceItem(item) && Number.isFinite(item.stock);

export const isOutOfStock = (item: StockAwareItem) =>
  isStockTrackedItem(item) && item.stock <= 0;

export const isLowStock = (item: StockAwareItem, threshold: number) =>
  isStockTrackedItem(item) && item.stock > 0 && item.stock <= threshold;

export const formatStockValue = (item: StockAwareItem) => {
  if (isServiceItem(item)) {
    return 'Unlimited';
  }
  if (Number.isFinite(item.stock)) {
    return item.stock;
  }
  return '--';
};
