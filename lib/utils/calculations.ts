/**
 * Calculate percentage change between two values
 * @param oldValue - The old value
 * @param newValue - The new value
 * @returns The percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0
  return ((newValue - oldValue) / oldValue) * 100
}

/**
 * Calculate the absolute change between two values
 * @param oldValue - The old value
 * @param newValue - The new value
 * @returns The absolute change
 */
export function calculateAbsoluteChange(oldValue: number, newValue: number): number {
  return newValue - oldValue
}

/**
 * Calculate the total of an array of numbers
 * @param values - Array of numbers
 * @returns The sum
 */
export function calculateTotal(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0)
}

/**
 * Calculate the average of an array of numbers
 * @param values - Array of numbers
 * @returns The average
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  return calculateTotal(values) / values.length
}

/**
 * Calculate percentage allocation
 * @param value - The value to calculate percentage for
 * @param total - The total value
 * @returns The percentage (0-100)
 */
export function calculatePercentageAllocation(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * Calculate compound interest
 * @param principal - Initial amount
 * @param rate - Interest rate (as decimal, e.g., 0.05 for 5%)
 * @param time - Time period in years
 * @param frequency - Compounding frequency per year (default: 12 for monthly)
 * @returns The final amount
 */
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  time: number,
  frequency: number = 12
): number {
  return principal * Math.pow(1 + rate / frequency, frequency * time)
}

/**
 * Calculate simple interest
 * @param principal - Initial amount
 * @param rate - Interest rate (as decimal, e.g., 0.05 for 5%)
 * @param time - Time period in years
 * @returns The interest amount
 */
export function calculateSimpleInterest(
  principal: number,
  rate: number,
  time: number
): number {
  return principal * rate * time
}

/**
 * Calculate monthly payment for a loan
 * @param principal - Loan amount
 * @param annualRate - Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @param months - Number of months
 * @returns The monthly payment
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (annualRate === 0) return principal / months

  const monthlyRate = annualRate / 12
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months)
  const denominator = Math.pow(1 + monthlyRate, months) - 1

  return numerator / denominator
}

/**
 * Round to specified decimal places
 * @param value - The value to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns The rounded value
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals)
  return Math.round(value * multiplier) / multiplier
}
