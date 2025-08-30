import { NextRequest, NextResponse } from 'next/server'
import { getTransactionsByUserAndDateRange } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')

    if (!year) {
      return NextResponse.json(
        { error: 'Year is required' },
        { status: 400 }
      )
    }

    const yearNum = parseInt(year)
    const startDate = new Date(yearNum, 0, 1) // January 1st
    const endDate = new Date(yearNum, 11, 31, 23, 59, 59) // December 31st

    // Get all transactions for the year
    const transactions = await getTransactionsByUserAndDateRange(startDate, endDate)

    // Group transactions by month
    const monthlyData: { [key: string]: { income: number; expense: number } } = {}

    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 }
      }

      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount
      } else {
        monthlyData[monthKey].expense += transaction.amount
      }
    })

    // Convert to array format and sort by month
    const reports = Object.entries(monthlyData)
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split('-')
        return {
          month,
          year: parseInt(year),
          income: data.income,
          expense: data.expense,
          balance: data.income - data.expense
        }
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return parseInt(a.month) - parseInt(b.month)
      })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Error fetching monthly reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}