export type SpendTab = 'Everyday spends' | 'Apps & Ecosystems' | 'Rent, Tax & Other';
export type SpendGroup = 'ONLINE & TRAVEL' | 'OFFLINE, FUEL & UPI' | 'OPTIONAL: SPLIT YOUR TRAVEL FOR SHARPER MATH' | 'ECOSYSTEMS' | 'RENT & TAX';

export interface SpendVector {
  id: string;
  label: string;
  description: string;
  group: SpendGroup;
  tab: SpendTab;
  max: number;
}

export const SPEND_VECTORS: SpendVector[] = [
  // Everyday Spends -> ONLINE & TRAVEL
  {
    id: 'quick-commerce',
    label: 'Quick Commerce',
    description: 'Instamart, Zepto, Blinkit',
    group: 'ONLINE & TRAVEL',
    tab: 'Everyday spends',
    max: 100000,
  },
  {
    id: 'food-delivery',
    label: 'Food Delivery',
    description: 'Swiggy, Zomato orders',
    group: 'ONLINE & TRAVEL',
    tab: 'Everyday spends',
    max: 60000,
  },
  {
    id: 'online-shopping',
    label: 'Online Shopping',
    description: 'Amazon, Flipkart, Myntra',
    group: 'ONLINE & TRAVEL',
    tab: 'Everyday spends',
    max: 200000,
  },
  {
    id: 'travel',
    label: 'Travel',
    description: 'Flights, hotels, cabs, IRCTC',
    group: 'ONLINE & TRAVEL',
    tab: 'Everyday spends',
    max: 200000,
  },
  {
    id: 'international-spends',
    label: 'International Spends',
    description: 'Foreign currency transactions',
    group: 'ONLINE & TRAVEL',
    tab: 'Everyday spends',
    max: 200000,
  },
  
  // Everyday Spends -> OPTIONAL
  {
    id: 'flights',
    label: 'Flights (booked directly / portals)',
    description: 'Split out if you book flights separately, bank travel portals price these higher',
    group: 'OPTIONAL: SPLIT YOUR TRAVEL FOR SHARPER MATH',
    tab: 'Everyday spends',
    max: 200000,
  },
  {
    id: 'hotels',
    label: 'Hotels',
    description: 'Split out hotel bookings, same reason',
    group: 'OPTIONAL: SPLIT YOUR TRAVEL FOR SHARPER MATH',
    tab: 'Everyday spends',
    max: 150000,
  },

  // Everyday Spends -> OFFLINE, FUEL & UPI
  {
    id: 'dining-offline',
    label: 'Dining Offline',
    description: 'Restaurants, cafés, QSR',
    group: 'OFFLINE, FUEL & UPI',
    tab: 'Everyday spends',
    max: 80000,
  },
  {
    id: 'general-offline',
    label: 'General Offline',
    description: 'Retail, grocery, utilities',
    group: 'OFFLINE, FUEL & UPI',
    tab: 'Everyday spends',
    max: 200000,
  },
  {
    id: 'fuel',
    label: 'Fuel',
    description: 'HPCL, IOCL, BPCL',
    group: 'OFFLINE, FUEL & UPI',
    tab: 'Everyday spends',
    max: 50000,
  },
  {
    id: 'upi-via-credit-card',
    label: 'UPI via Credit Card',
    description: 'RuPay credit card UPI spends',
    group: 'OFFLINE, FUEL & UPI',
    tab: 'Everyday spends',
    max: 100000,
  },

  // Apps & Ecosystems -> ECOSYSTEMS
  {
    id: 'tata-neu',
    label: 'Tata Neu Ecosystem',
    description: 'BigBasket, 1mg, Croma, Air India',
    group: 'ECOSYSTEMS',
    tab: 'Apps & Ecosystems',
    max: 100000,
  },
  {
    id: 'reliance',
    label: 'Reliance Ecosystem',
    description: 'JioMart, Reliance Digital, Trends',
    group: 'ECOSYSTEMS',
    tab: 'Apps & Ecosystems',
    max: 100000,
  },

  // Rent, Tax & Other -> RENT & TAX
  {
    id: 'rent',
    label: 'Rent Payments',
    description: 'Housing rent via apps (Cred, RedGirraffe)',
    group: 'RENT & TAX',
    tab: 'Rent, Tax & Other',
    max: 200000,
  },
  {
    id: 'tax',
    label: 'Tax & Govt Payments',
    description: 'Advance tax, property tax',
    group: 'RENT & TAX',
    tab: 'Rent, Tax & Other',
    max: 500000,
  },
  {
    id: 'education',
    label: 'Education & Fees',
    description: 'School, college fees',
    group: 'RENT & TAX',
    tab: 'Rent, Tax & Other',
    max: 200000,
  }
];
