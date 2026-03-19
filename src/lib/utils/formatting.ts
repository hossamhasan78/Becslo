export function formatCurrency(amount: number): string {
  const rounded = roundToNearestDollar(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
}

export function roundToNearestDollar(amount: number): number {
  return Math.round(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
