import type { RetirementProjection } from '@/types'

// Korean Won exchange rate (approximate, refresh via API in production)
export const USD_TO_KRW = 1320

// Retirement planning constants
const ANNUAL_RETURN_RATE = 0.07       // 7% avg annual return
const INFLATION_RATE = 0.03           // 3% inflation
const SAFE_WITHDRAWAL_RATE = 0.04     // 4% rule
const FI_MULTIPLIER = 25              // 25x annual expenses = FI number

export function calculateRetirementProjection(params: {
  currentNetWorth: number
  monthlyContributions: number
  monthlyExpenses: number
  koreaMonthlyBudgetUSD: number
  currentYear: number
  targetRetirementYear: number
  usdToKrw?: number
}): RetirementProjection {
  const {
    currentNetWorth,
    monthlyContributions,
    koreaMonthlyBudgetUSD,
    currentYear,
    targetRetirementYear,
    usdToKrw = USD_TO_KRW,
  } = params

  const yearsToRetirement = targetRetirementYear - currentYear
  const annualExpensesInRetirement = koreaMonthlyBudgetUSD * 12

  // FI number = 25x annual expenses
  const fiNumber = annualExpensesInRetirement * FI_MULTIPLIER

  // Future value of current portfolio
  const fvCurrentPortfolio =
    currentNetWorth * Math.pow(1 + ANNUAL_RETURN_RATE, yearsToRetirement)

  // Future value of monthly contributions (annuity)
  const monthlyRate = ANNUAL_RETURN_RATE / 12
  const months = yearsToRetirement * 12
  const fvContributions =
    monthlyContributions * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)

  const projectedNetWorthAtRetirement = fvCurrentPortfolio + fvContributions

  // How much needs to be saved monthly to reach FI number
  const shortfall = Math.max(0, fiNumber - fvCurrentPortfolio)
  const monthlyContributionNeeded =
    shortfall > 0
      ? (shortfall * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1)
      : 0

  const progressPercent = Math.min(100, (currentNetWorth / fiNumber) * 100)
  const onTrack = projectedNetWorthAtRetirement >= fiNumber

  return {
    currentNetWorth,
    targetNetWorth: fiNumber,
    yearsToRetirement,
    projectedNetWorthAtRetirement,
    monthlyContributionNeeded,
    koreaMonthlyBudgetUSD,
    koreaMonthlyBudgetKRW: koreaMonthlyBudgetUSD * usdToKrw,
    annualExpensesInRetirement,
    fiNumber,
    progressPercent,
    onTrack,
  }
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  if (currency === 'KRW') {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}
