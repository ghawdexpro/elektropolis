/**
 * Collection-specific filter definitions.
 *
 * Each collection handle maps to an array of spec-based filters that are
 * relevant for that product category.  The server extracts the available
 * values at render time so only filters with actual data are shown.
 *
 * `specKey`   — the key inside the product `specifications` JSONB array
 * `label`     — human-readable label shown in the sidebar
 * `param`     — URL search-param name  (e.g. ?finish=chrome)
 * `normalize` — optional fn to clean up raw values before grouping
 */

export interface SpecFilterDef {
  specKey: string;
  label: string;
  param: string;
  /** Max options to display before "Show more" (default 8) */
  maxVisible?: number;
}

/** Available filter values extracted from real product data */
export interface SpecFilterValues {
  param: string;
  label: string;
  values: string[]; // sorted, de-duped
}

// ─── Helpers ─────────────────────────────────────────────────────

function colorFilter(param = "color"): SpecFilterDef {
  return { specKey: "Variant", label: "Colour", param, maxVisible: 10 };
}

function sizeFilter(): SpecFilterDef {
  return { specKey: "Size", label: "Size", param: "size" };
}

function materialFilter(): SpecFilterDef {
  return { specKey: "Material", label: "Material", param: "material" };
}

function finishFilter(): SpecFilterDef {
  return { specKey: "Finish", label: "Finish", param: "finish", maxVisible: 10 };
}

function mountingTypeFilter(): SpecFilterDef {
  return { specKey: "Mounting type", label: "Mounting Type", param: "mountingType" };
}

function surfaceTypeFilter(): SpecFilterDef {
  return { specKey: "Surface type", label: "Surface", param: "surface" };
}

// ─── Per-Collection Filter Configs ───────────────────────────────

const COLLECTION_FILTERS: Record<string, SpecFilterDef[]> = {
  // ── Kitchen ────────────────────────────────────
  "kitchen-sinks": [
    materialFilter(),
    finishFilter(),
    surfaceTypeFilter(),
    sizeFilter(),
    { specKey: "Shape", label: "Shape", param: "shape" },
  ],
  "sink-mixers": [
    finishFilter(),
    mountingTypeFilter(),
    { specKey: "Faucet type", label: "Faucet Type", param: "faucetType" },
    { specKey: "Spout type", label: "Spout Type", param: "spoutType" },
    materialFilter(),
  ],
  "dishwashers": [colorFilter(), sizeFilter()],

  // ── Bathroom ───────────────────────────────────
  "bathroom-fixtures": [
    finishFilter(),
    materialFilter(),
    surfaceTypeFilter(),
    mountingTypeFilter(),
    { specKey: "Shape", label: "Shape", param: "shape" },
  ],
  "accessories": [
    finishFilter(),
    materialFilter(),
    surfaceTypeFilter(),
  ],

  // ── Cooking ────────────────────────────────────
  "chimney-cooker-hoods": [colorFilter(), sizeFilter()],
  "canopy-extractor-hood": [colorFilter(), sizeFilter()],
  "telescopic-extractor-hoods": [colorFilter(), sizeFilter()],
  "built-in-ovens": [colorFilter(), sizeFilter()],
  "freestanding-cookers": [colorFilter(), sizeFilter()],
  "gas-hobs": [colorFilter(), sizeFilter()],
  "electric-hobs": [colorFilter(), sizeFilter()],
  "microwave-ovens": [colorFilter(), sizeFilter()],

  // ── Laundry ────────────────────────────────────
  "freestanding-washing-machines": [colorFilter(), sizeFilter()],
  "freestanding-washer-dryers": [colorFilter(), sizeFilter()],
  "tumble-dryers": [colorFilter(), sizeFilter()],
  "integrated-washing-machines": [colorFilter(), sizeFilter()],
  "integrated-washer-dryers": [colorFilter(), sizeFilter()],

  // ── Refrigeration ──────────────────────────────
  "freestanding-fridge-freezers": [
    colorFilter(),
    sizeFilter(),
    {
      specKey: "Product sheet according to EU Regulation 2019/2016 - Installation type",
      label: "Installation",
      param: "installation",
    },
  ],
  "freestanding-fridges": [colorFilter(), sizeFilter()],
  "freestanding-freezers": [colorFilter(), sizeFilter()],
  "chest-freezers": [colorFilter(), sizeFilter()],
  "integrated-fridge-freezers": [colorFilter(), sizeFilter()],
  "integrated-fridges": [colorFilter(), sizeFilter()],
  "integrated-freezers": [colorFilter(), sizeFilter()],

  // ── Climate ────────────────────────────────────
  "air-conditions": [colorFilter()],
  "air-treatment": [colorFilter()],
  "heaters": [colorFilter()],
  "water-heaters": [colorFilter(), sizeFilter()],

  // ── Other ──────────────────────────────────────
  "small-appliances": [colorFilter()],
  "brown-goods": [colorFilter(), sizeFilter()],
  "water-treatment": [],
  "floorcare": [colorFilter()],
};

/**
 * Return the spec-filter definitions for a given collection handle.
 * Falls back to an empty array for unknown collections.
 */
export function getCollectionFilterDefs(handle: string): SpecFilterDef[] {
  return COLLECTION_FILTERS[handle] ?? [];
}

/**
 * Normalise a raw spec value for display.
 *  - Title-case
 *  - Trim whitespace
 *  - Collapse "COLOUR WHITE" → "White"
 */
export function normalizeSpecValue(raw: string): string {
  let v = raw.trim();
  if (!v) return v;
  // Strip "COLOUR " prefix (Ventura convention)
  v = v.replace(/^COLOUR\s+/i, "");
  // Title-case
  v = v
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return v;
}

/**
 * Given an array of products (each with `specifications` JSONB) and the
 * filter definitions for the collection, extract the available values for
 * every filter that actually has data.
 */
export function extractSpecFilterValues(
  products: { specifications?: { key: string; value: string }[] | null }[],
  defs: SpecFilterDef[]
): SpecFilterValues[] {
  if (defs.length === 0) return [];

  const result: SpecFilterValues[] = [];

  for (const def of defs) {
    const valueSet = new Set<string>();

    for (const product of products) {
      const specs = product.specifications;
      if (!specs || !Array.isArray(specs)) continue;

      for (const spec of specs) {
        if (spec.key === def.specKey && spec.value) {
          const normalized = normalizeSpecValue(spec.value);
          if (normalized) valueSet.add(normalized);
        }
      }
    }

    // Only include filters that have at least 2 options (1 option = no point filtering)
    if (valueSet.size >= 2) {
      result.push({
        param: def.param,
        label: def.label,
        values: [...valueSet].sort(),
      });
    }
  }

  return result;
}

/**
 * All possible spec filter param names, used for type-safe URL parsing.
 */
export const ALL_SPEC_PARAMS = [
  "color",
  "size",
  "material",
  "finish",
  "mountingType",
  "surface",
  "shape",
  "faucetType",
  "spoutType",
  "installation",
] as const;

export type SpecParam = (typeof ALL_SPEC_PARAMS)[number];
