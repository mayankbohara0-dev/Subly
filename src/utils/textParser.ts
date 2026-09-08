// TrialGuard — Smart Confirmation Text & Receipt Parser
// Extracts service name, trial duration, and price from email snippets or SMS alerts

import { SERVICE_PRESETS, ServicePreset } from '../constants/servicePresets';
import { BillingCycle } from '../types';

export interface ParsedTrialInfo {
  serviceName?: string;
  chargeAmount?: number;
  currency?: string;
  trialDays?: number;
  endDate?: Date;
  billingCycle?: BillingCycle;
  cancellationUrl?: string;
  confidenceNotes: string[];
}

export function parseTrialConfirmation(rawText: string): ParsedTrialInfo {
  const notes: string[] = [];
  const text = rawText.trim();
  const lower = text.toLowerCase();

  let matchedPreset: ServicePreset | undefined;
  let serviceName: string | undefined;
  let chargeAmount: number | undefined;
  let currency = 'INR';
  let trialDays: number | undefined;
  let endDate: Date | undefined;
  let billingCycle: BillingCycle = 'monthly';
  let cancellationUrl: string | undefined;

  // 1. Detect known service preset
  for (const preset of SERVICE_PRESETS) {
    const simpleName = preset.name.toLowerCase().split(' ')[0];
    if (lower.includes(preset.name.toLowerCase()) || lower.includes(simpleName)) {
      matchedPreset = preset;
      serviceName = preset.name;
      trialDays = preset.trialDays;
      chargeAmount = preset.defaultPrice;
      currency = preset.currency;
      billingCycle = preset.billingCycle;
      cancellationUrl = preset.cancellationUrl;
      notes.push(`Detected service: ${preset.name}`);
      break;
    }
  }

  // If no preset matched, try regex for service name
  if (!serviceName) {
    const nameMatch = text.match(/(?:welcome to|subscribed to|free trial of|started your|membership for)\s+([A-Za-z0-9 &+.'-]+?)(?:\!|\.|\,| for | free|\n|$)/i);
    if (nameMatch && nameMatch[1]) {
      serviceName = nameMatch[1].trim();
      notes.push(`Extracted name: ${serviceName}`);
    }
  }

  // 2. Extract Price & Currency symbol (defaults to INR)
  const priceRegex = /(₹|rs\.?|[$€£¥])\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:INR|Rs|USD|EUR|GBP)/i;
  const priceMatch = text.match(priceRegex);
  if (priceMatch) {
    if (priceMatch[1] && priceMatch[2]) {
      const symbol = priceMatch[1].toLowerCase();
      if (symbol === '₹' || symbol.startsWith('rs')) currency = 'INR';
      else if (symbol === '$') currency = 'USD';
      else if (symbol === '€') currency = 'EUR';
      else if (symbol === '£') currency = 'GBP';
      chargeAmount = parseFloat(priceMatch[2]);
      notes.push(`Found price: ${symbol.toUpperCase()} ${chargeAmount}`);
    } else if (priceMatch[3]) {
      chargeAmount = parseFloat(priceMatch[3]);
      notes.push(`Found price: ₹${chargeAmount}`);
    }
  }

  // 3. Extract Trial Duration (days / weeks / months)
  const daysMatch = text.match(/(\d+)\s*[- ]?(?:day|days|d)\b/i);
  const weeksMatch = text.match(/(\d+)\s*[- ]?(?:week|weeks|wk)\b/i);
  const monthsMatch = text.match(/(\d+)\s*[- ]?(?:month|months|mo)\b/i);

  if (daysMatch && daysMatch[1]) {
    trialDays = parseInt(daysMatch[1], 10);
    notes.push(`Found ${trialDays}-day trial period`);
  } else if (weeksMatch && weeksMatch[1]) {
    trialDays = parseInt(weeksMatch[1], 10) * 7;
    notes.push(`Found ${weeksMatch[1]}-week trial period (${trialDays} days)`);
  } else if (monthsMatch && monthsMatch[1]) {
    trialDays = parseInt(monthsMatch[1], 10) * 30;
    notes.push(`Found ${monthsMatch[1]}-month trial period (${trialDays} days)`);
  }

  // If explicit date found (e.g. "ends on Oct 25, 2026")
  const dateMatch = text.match(/(?:ends? on|renews? on|first charge on|before|until)\s+([A-Za-z]{3,9}\s+\d{1,2}(?:,?\s*\d{4})?|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i);
  if (dateMatch && dateMatch[1]) {
    const parsed = new Date(dateMatch[1]);
    if (!isNaN(parsed.getTime())) {
      endDate = parsed;
      notes.push(`Parsed explicit end date: ${dateMatch[1]}`);
    }
  }

  // If we have trialDays but no explicit endDate, compute from today
  if (trialDays && !endDate) {
    const d = new Date();
    d.setDate(d.getDate() + trialDays);
    endDate = d;
  }

  // 4. Extract billing cycle
  if (/year|annual|\/yr/i.test(lower)) {
    billingCycle = 'yearly';
  } else if (/week|\/wk/i.test(lower)) {
    billingCycle = 'weekly';
  } else if (/month|\/mo/i.test(lower)) {
    billingCycle = 'monthly';
  }

  // 5. Extract URL if present
  const urlMatch = text.match(/https?:\/\/[^\s"'<>]+/i);
  if (urlMatch && !cancellationUrl) {
    cancellationUrl = urlMatch[0];
  }

  return {
    serviceName,
    chargeAmount,
    currency,
    trialDays,
    endDate,
    billingCycle,
    cancellationUrl,
    confidenceNotes: notes,
  };
}
