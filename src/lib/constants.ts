export const SITE_NAME = "ElektroPolis Malta";
export const SITE_DESCRIPTION =
  "Buy kitchen appliances, air conditioners, sinks & taps at massively discounted prices.";
export const STORE_EMAIL = "info@elektropolis.mt";
export const STORE_PHONE = "(+356) 9921 3791";
export const STORE_CURRENCY = "EUR";
export const STORE_COUNTRY = "MT";

export const LOCATIONS = [
  {
    name: "Victoria Showroom",
    address: "Triq Kercem, Victoria, VCT9055, Gozo, Malta",
    phone: "(+356) 9921 3791",
    email: "info@elektropolis.mt",
  },
  {
    name: "Service Department",
    address: "Triq l-Imgarr, Ghajnsielem, GSM9010, Gozo, Malta",
    phone: "(+356) 9921 3791",
    email: "customercare@elektropolis.mt",
  },
  {
    name: "Warehouse",
    address: "Triq Guze Ellul Mercer, Nadur, NDR2222, Gozo, Malta",
    phone: "(+356) 9921 3791",
    email: "warehouse@elektropolis.mt",
  },
] as const;

export const NAV_CATEGORIES = [
  {
    title: "Kitchen",
    items: [
      { name: "Kitchen Sinks", handle: "kitchen-sinks" },
      { name: "Kitchen Sink Mixers", handle: "sink-mixers" },
      { name: "Chimney Cooker Hoods", handle: "chimney-cooker-hoods" },
      { name: "Canopy Cooker Hoods", handle: "canopy-extractor-hood" },
      { name: "Telescopic Cooker Hoods", handle: "telescopic-extractor-hoods" },
    ],
  },
  {
    title: "Laundry",
    items: [
      { name: "Freestanding Washing Machines", handle: "freestanding-washing-machines" },
      { name: "Integrated Washing Machines", handle: "integrated-washing-machines" },
      { name: "Freestanding Washer Dryers", handle: "freestanding-washer-dryers" },
      { name: "Integrated Washer Dryers", handle: "integrated-washer-dryers" },
    ],
  },
  {
    title: "Refrigeration",
    items: [
      { name: "Freestanding Fridge Freezers", handle: "freestanding-fridge-freezers" },
      { name: "Freestanding Fridges", handle: "freestanding-fridges" },
      { name: "Freestanding Freezers", handle: "freestanding-freezers" },
      { name: "Integrated Fridge Freezers", handle: "integrated-fridge-freezers" },
      { name: "Integrated Fridges", handle: "integrated-fridges" },
      { name: "Integrated Freezers", handle: "integrated-freezers" },
      { name: "Chest Freezers", handle: "chest-freezers" },
    ],
  },
  {
    title: "Home",
    items: [
      { name: "Air Treatment", handle: "air-treatment" },
      { name: "Water Treatment", handle: "water-treatment" },
      { name: "Floorcare", handle: "floorcare" },
    ],
  },
] as const;
