-- ============================================
-- 006: Collection Hero Images (Unsplash)
-- ============================================
-- Adds hero images to all visible collections using free Unsplash photos.
-- Images sized at w=800&h=500 to match the 16:10 aspect ratio on the storefront.
-- Also hides the "frontpage" pseudo-collection from the storefront listing.

-- Hide Shopify's frontpage pseudo-collection
UPDATE collections SET is_visible = false WHERE handle = 'frontpage';

-- ========================
-- Cooker Hoods
-- ========================
UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1758098491492-6501dfb2ae7d?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'canopy-extractor-hood';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1451187863213-d1bcbaae3fa3?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'chimney-cooker-hoods';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'telescopic-extractor-hoods';

-- ========================
-- Refrigeration
-- ========================
UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1530950837622-262e7f56f087?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'chest-freezers';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1699870798609-b5c3e7e5900d?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'freestanding-freezers';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'freestanding-fridge-freezers';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'freestanding-fridges';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1703243373837-9f96a7d565d1?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'integrated-freezers';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1722649939430-9f615b049e7c?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'integrated-fridge-freezers';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1687946939402-a02bfa7af289?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'integrated-fridges';

-- ========================
-- Laundry
-- ========================
UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1585314293845-4db3b9d0c6e9?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'freestanding-washer-dryers';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'freestanding-washing-machines';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1586284359445-2e1d8db7f4cd?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'integrated-washer-dryers';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1622473590925-e3616c0a41bf?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'integrated-washing-machines';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1632923565835-6582b54f2105?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'tumble-dryers';

-- ========================
-- Kitchen & Cooking
-- ========================
UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1596958837479-7fba2070a2e5?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'kitchen-sinks';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1610276099118-c929abaaa80a?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'sink-mixers';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1544509494-6252e14b089c?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'dishwashers';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1682888818620-94875adf5bb9?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'built-in-ovens';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'freestanding-cookers';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1608454781855-613047b52c94?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'gas-hobs';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1631985455894-65311148a768?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'electric-hobs';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1589241534732-26031c00f37c?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'microwave-ovens';

-- ========================
-- Climate & Air
-- ========================
UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1649711895336-20ff39db62f8?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'air-conditions';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1601084195907-44baaa49dabd?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'air-treatment';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1669725341213-7379ff6c90d5?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'heaters';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1610276173132-c47d148ab626?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'water-heaters';

-- ========================
-- Water & Bathroom
-- ========================
UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1597742439545-1d6eaf54a470?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'water-treatment';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1754574741164-a41418029cfb?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'bathroom-fixtures';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1676976528790-968650f44264?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'accessories';

-- ========================
-- Other
-- ========================
UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1647940990395-967898eb0d65?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'floorcare';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1693875161720-b0c2401c1874?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'small-appliances';

UPDATE collections SET image_url = 'https://images.unsplash.com/photo-1635788798247-92a15f830a3b?w=800&h=500&fit=crop&q=80'
  WHERE handle = 'brown-goods';
