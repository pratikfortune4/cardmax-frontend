export interface SpendVector {
  id: string;
  label: string;
  max: number;
}

export const SPEND_VECTORS: SpendVector[] = [
  {
    id: 'shopping',
    label: 'Shopping',
    max: 100000,
  },
  {
    id: 'food-dining',
    label: 'Food & Dining',
    max: 50000,
  },
  {
    id: 'travel',
    label: 'Travel',
    max: 150000,
  },
  {
    id: 'bills-utilities',
    label: 'Bills & Utilities',
    max: 50000,
  },
  {
    id: 'groceries',
    label: 'Groceries',
    max: 50000,
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    max: 50000,
  },
  {
    id: 'health-wellness',
    label: 'Health & Wellness',
    max: 50000,
  },
  {
    id: 'other',
    label: 'Other',
    max: 100000,
  }
];
