// TrialGuard — Currency Utilities

import { Currency } from '../types';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
};

export const CURRENCY_OPTIONS: { label: string; value: Currency }[] = [
  { label: '₹ Indian Rupee (INR)', value: 'INR' },
  { label: '$ US Dollar (USD)', value: 'USD' },
  { label: '€ Euro (EUR)', value: 'EUR' },
  { label: '£ British Pound (GBP)', value: 'GBP' },
  { label: 'A$ Australian Dollar (AUD)', value: 'AUD' },
  { label: 'C$ Canadian Dollar (CAD)', value: 'CAD' },
];

/**
 * Format a charge amount with currency symbol.
 * e.g. formatCurrency(119, 'INR') → "₹119"
 */
export function formatCurrency(amount: number, currency: Currency = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  if (Number.isInteger(amount)) {
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  }
  return `${symbol}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Billing cycle labels
 */
export const BILLING_CYCLE_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
  custom: 'Custom',
};

/**
 * Validate that a string is a valid URL.
 */
export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
