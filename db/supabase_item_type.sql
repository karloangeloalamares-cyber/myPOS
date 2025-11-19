-- Item type enum/schema alignment for myPOS
-- Run this in Supabase SQL Editor (Postgres 15+)

-- 1) Create enum if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    WHERE t.typname = 'item_type'
  ) THEN
    CREATE TYPE item_type AS ENUM (
      'product','service','menu','ingredient','consumable'
    );
  END IF;
END$$;

-- 2) Ensure the enum has the new value (safe if already present)
ALTER TYPE item_type ADD VALUE IF NOT EXISTS 'consumable';

-- 3) Attach to your items/products table
--    Adjust table/column names to match your schema.
--    If you currently store type as text with a CHECK, see step (4).
ALTER TABLE IF EXISTS items
  ADD COLUMN IF NOT EXISTS item_type item_type DEFAULT 'product' NOT NULL;

ALTER TABLE IF EXISTS products
  ADD COLUMN IF NOT EXISTS item_type item_type DEFAULT 'product' NOT NULL;

-- 4) If you used TEXT + CHECK constraint previously, update it.
--    Example (items table using TEXT):
--    ALTER TABLE items
--      ADD COLUMN IF NOT EXISTS item_type_text text;
--    ALTER TABLE items
--      ADD CONSTRAINT items_item_type_check
--        CHECK (item_type_text IN ('product','service','menu','ingredient','consumable'));

-- 5) Backfill legacy NULLs or blank values
UPDATE items SET item_type = 'product'::item_type
WHERE item_type IS NULL;

UPDATE products SET item_type = 'product'::item_type
WHERE item_type IS NULL;

-- 6) Optional: indexes for queries/filters
CREATE INDEX IF NOT EXISTS idx_items_item_type ON items (item_type);
CREATE INDEX IF NOT EXISTS idx_products_item_type ON products (item_type);

-- 7) Heuristic service backfill (safe guards for optional columns/tables)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'items'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'items' AND column_name = 'category'
    ) THEN
      UPDATE items
      SET item_type = 'service'::item_type
      WHERE item_type IS DISTINCT FROM 'service'
        AND category ILIKE '%service%';
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'items' AND column_name = 'name'
    ) THEN
      UPDATE items
      SET item_type = 'service'::item_type
      WHERE item_type IS DISTINCT FROM 'service'
        AND name ILIKE '%service%';
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'products'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'category'
    ) THEN
      UPDATE products
      SET item_type = 'service'::item_type
      WHERE item_type IS DISTINCT FROM 'service'
        AND category ILIKE '%service%';
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'name'
    ) THEN
      UPDATE products
      SET item_type = 'service'::item_type
      WHERE item_type IS DISTINCT FROM 'service'
        AND name ILIKE '%service%';
    END IF;
  END IF;
END$$;
