// Utility function to format numbers with commas
export function formatNumber(num: number): string {
  return num.toLocaleString('en-GB')
}

// Utility function to format currency
export function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`
}
