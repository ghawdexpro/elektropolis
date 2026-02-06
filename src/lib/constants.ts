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
      { name: "Dishwashers", handle: "dishwashers" },
    ],
  },
  {
    title: "Cooking",
    items: [
      { name: "Cooker Hoods", handle: "chimney-cooker-hoods" },
      { name: "Built-in Ovens", handle: "built-in-ovens" },
      { name: "Freestanding Cookers", handle: "freestanding-cookers" },
      { name: "Gas Hobs", handle: "gas-hobs" },
      { name: "Electric Hobs", handle: "electric-hobs" },
      { name: "Microwave Ovens", handle: "microwave-ovens" },
    ],
  },
  {
    title: "Laundry",
    items: [
      { name: "Washing Machines", handle: "freestanding-washing-machines" },
      { name: "Washer Dryers", handle: "freestanding-washer-dryers" },
      { name: "Tumble Dryers", handle: "tumble-dryers" },
    ],
  },
  {
    title: "Refrigeration",
    items: [
      { name: "Fridge Freezers", handle: "freestanding-fridge-freezers" },
      { name: "Freestanding Fridges", handle: "freestanding-fridges" },
      { name: "Freestanding Freezers", handle: "freestanding-freezers" },
      { name: "Chest Freezers", handle: "chest-freezers" },
    ],
  },
  {
    title: "Climate",
    items: [
      { name: "Air Conditioners", handle: "air-conditions" },
      { name: "Air Coolers & Fans", handle: "air-treatment" },
      { name: "Heaters", handle: "heaters" },
      { name: "Water Heaters", handle: "water-heaters" },
    ],
  },
  {
    title: "More",
    items: [
      { name: "Small Appliances", handle: "small-appliances" },
      { name: "Brown Goods", handle: "brown-goods" },
      { name: "Water Treatment", handle: "water-treatment" },
      { name: "Floorcare", handle: "floorcare" },
    ],
  },
  {
    title: "Support",
    items: [
      { name: "Contact Us", handle: "/contact" },
      { name: "FAQs", handle: "/faqs" },
      { name: "Parts & Repairs", handle: "/contact" },
    ],
  },
] as const;
