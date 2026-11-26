// Centralized formatting utilities (PKR non-breaking space + tabular numerals)

const NBSP = '\u00A0';

/**
 * Formats a numeric amount into Pakistani Rupees using an explicit non-breaking space:
 * e.g. `PKR\u00A04,850`
 */
export function formatPKR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') {
    return `PKR${NBSP}0`;
  }
  const numeric = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(numeric)) {
    return `PKR${NBSP}0`;
  }
  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(Math.round(numeric));

  return `PKR${NBSP}${formatted}`;
}

export function formatDate(
  input: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }
): string {
  if (!input) return '—';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-PK', options).format(date);
}

export function formatDateTime(input: string | number | Date | null | undefined): string {
  return formatDate(input, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('en-PK', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
