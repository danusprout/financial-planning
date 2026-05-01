'use client'

import { createContext, useContext, useState } from 'react'

type Lang = 'en' | 'id'

const translations = {
  en: {
    dashboard: 'Dashboard',
    budget: 'Budget Plan',
    income: 'Income',
    expenses: 'Expenses',
    savings: 'Savings',
    installments: 'Installments',
    settings: 'Settings',
    logout: 'Logout',
    // budget page
    budgetPlan: 'Monthly Budget Plan',
    category: 'Category',
    item: 'Item',
    budgetEst: 'Budget (Est.)',
    actual: 'Actual',
    progress: 'Progress',
    notes: 'Notes',
    // sections
    incomeSection: 'INCOME',
    needsSection: 'EXPENSES - NEEDS',
    obligationsSection: 'EXPENSES - OBLIGATIONS & INSTALLMENTS',
    wantsSection: 'EXPENSES - LIFESTYLE & SOCIAL (WANTS)',
    savingsSection: 'SAVINGS & INVESTMENTS',
    summary: 'SUMMARY',
    totalIncome: 'Total Income',
    totalExpenses: 'Total Expenses',
    totalSavings: 'Total Savings',
    remainingBalance: 'Remaining Balance',
    // Page titles + subtitles
    expensesTitle: 'Daily Expenses',
    expensesSubtitle: 'Log daily expenses by category',
    incomeTitle: 'Income',
    incomeSubtitle: 'Track monthly income sources',
    dashboardTitle: 'Dashboard',
    dashboardSubtitle: 'Monthly financial summary',
    savingsTitle: 'Savings',
    savingsSubtitle: 'Track saving goals and withdrawals',
    installmentsTitle: 'Loans & Installments',
    installmentsSubtitle: 'Manage loans and payment schedule',
    // Common actions
    add: 'Add',
    savingLabel: 'Saving...',
    // Expenses page
    allCategories: 'All categories',
    allPaymentSources: 'All payment sources',
    addExpense: 'Add Expense',
    editExpense: 'Edit Expense',
    noExpenses: 'No expenses this month',
    confirmDeleteExpense: 'Delete this expense?',
    statusPaid: 'Paid',
    statusPending: 'Pending',
    statusPlanned: 'Planned',
    // Income page
    addIncome: 'Add Income',
    editIncome: 'Edit Income',
    noIncome: 'No income this month',
    confirmDeleteIncome: 'Delete this income?',
    // Dashboard
    netSavingsLabel: 'Net Savings',
    remainingBalanceLabel: 'Remaining Balance',
    upcomingDue: 'Due in the next 7 days',
    expenseBreakdown: 'Expense Breakdown',
    budgetVsActual: 'Budget vs Actual',
    differenceLabel: 'Difference',
    noUpcoming: 'No upcoming installments',
    // Installments
    totalActiveDebt: 'Total Remaining Active Debt',
    addLoan: 'Add Loan',
    noLoans: 'No loans yet',
    paidOffInactive: 'Paid Off / Inactive',
    originalDebt: 'Original Debt',
    alreadyPaid: 'Paid',
    remainingDebt: 'Remaining',
    percentPaid: '% Paid',
    loanName: 'Loan Name',
    monthlyPayment: 'Monthly Payment (Rp)',
    tenorLabel: 'Tenor (months, optional)',
    startDateLabel: 'Start Date',
    paymentSourceOpt: 'Payment Source (optional)',
    confirmDeleteLoan: 'Delete this loan?',
    selectBank: 'Select bank',
    noneOption: '— None —',
    initialDebt: 'Initial Debt (Rp)',
    // Savings
    noGoals: 'No saving goals yet',
    addGoal: 'Add Goal',
    goalName: 'Goal Name',
    targetAmount: 'Target Amount (Rp, optional)',
    targetDate: 'Target Date (optional)',
    balance: 'Balance',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    depositToGoal: 'Deposit to Goal',
    withdrawFromGoal: 'Withdraw from Goal',
    amount: 'Amount (Rp)',
    note: 'Note (optional)',
    goalsTab: 'Goals',
    monthlyTab: 'Monthly',
    withdrawalsTab: 'Withdrawals',
    totalBalance: 'Total Balance',
    totalTarget: 'Total Target',
    activeGoals: 'Active Goals',
    monthlyRecap: 'Monthly Savings Recap',
    withdrawalLog: 'Withdrawal Log',
    noWithdrawals: 'No withdrawals yet',
    noMonthlyData: 'No savings data yet',
    confirmDeleteTx: 'Delete this transaction?',
    done: 'Done',
  },
  id: {
    dashboard: 'Dashboard',
    budget: 'Rencana Anggaran',
    income: 'Pemasukan',
    expenses: 'Pengeluaran',
    savings: 'Tabungan',
    installments: 'Cicilan',
    settings: 'Pengaturan',
    logout: 'Keluar',
    budgetPlan: 'Rencana Anggaran Bulanan',
    category: 'Kategori',
    item: 'Item / Rincian',
    budgetEst: 'Estimasi',
    actual: 'Realisasi',
    progress: 'Progress',
    notes: 'Catatan',
    incomeSection: 'PEMASUKAN',
    needsSection: 'PENGELUARAN - KEBUTUHAN (NEEDS)',
    obligationsSection: 'PENGELUARAN - KEWAJIBAN & CICILAN',
    wantsSection: 'PENGELUARAN - GAYA HIDUP & SOSIAL (WANTS)',
    savingsSection: 'TABUNGAN & INVESTASI',
    summary: 'RINGKASAN AKHIR',
    totalIncome: 'Total Pemasukan',
    totalExpenses: 'Total Pengeluaran',
    totalSavings: 'Total Tabungan',
    remainingBalance: 'Sisa Saldo',
    // Page titles + subtitles
    expensesTitle: 'Pengeluaran Harian',
    expensesSubtitle: 'Log pengeluaran per hari',
    incomeTitle: 'Pemasukan',
    incomeSubtitle: 'Catat sumber pemasukan per bulan',
    dashboardTitle: 'Dashboard',
    dashboardSubtitle: 'Ringkasan keuangan bulanan',
    savingsTitle: 'Tabungan',
    savingsSubtitle: 'Kelola tabungan dan penarikan',
    installmentsTitle: 'Cicilan & Hutang',
    installmentsSubtitle: 'Kelola pinjaman dan jadwal pembayaran',
    // Common actions
    add: 'Tambah',
    savingLabel: 'Menyimpan...',
    // Expenses page
    allCategories: 'Semua kategori',
    allPaymentSources: 'Semua sumber dana',
    addExpense: 'Tambah Pengeluaran',
    editExpense: 'Edit Pengeluaran',
    noExpenses: 'Belum ada pengeluaran bulan ini',
    confirmDeleteExpense: 'Hapus pengeluaran ini?',
    statusPaid: 'Dibayar',
    statusPending: 'Pending',
    statusPlanned: 'Rencana',
    // Income page
    addIncome: 'Tambah Pemasukan',
    editIncome: 'Edit Pemasukan',
    noIncome: 'Belum ada pemasukan bulan ini',
    confirmDeleteIncome: 'Hapus pemasukan ini?',
    // Dashboard
    netSavingsLabel: 'Tabungan (net)',
    remainingBalanceLabel: 'Sisa Saldo',
    upcomingDue: 'Cicilan jatuh tempo 7 hari ke depan',
    expenseBreakdown: 'Breakdown Pengeluaran',
    budgetVsActual: 'Estimasi vs Realisasi',
    differenceLabel: 'Selisih',
    noUpcoming: 'Tidak ada cicilan jatuh tempo',
    // Installments
    totalActiveDebt: 'Total Sisa Hutang Aktif',
    addLoan: 'Tambah Pinjaman',
    noLoans: 'Belum ada pinjaman',
    paidOffInactive: 'Lunas / Tidak Aktif',
    originalDebt: 'Hutang Awal',
    alreadyPaid: 'Sudah Dibayar',
    remainingDebt: 'Sisa',
    percentPaid: '% Lunas',
    loanName: 'Nama Pinjaman',
    monthlyPayment: 'Cicilan/Bulan (Rp)',
    tenorLabel: 'Tenor (bulan, opsional)',
    startDateLabel: 'Tanggal Mulai',
    paymentSourceOpt: 'Sumber Dana (opsional)',
    confirmDeleteLoan: 'Hapus pinjaman ini?',
    selectBank: 'Pilih bank',
    noneOption: '— Tidak ada —',
    initialDebt: 'Hutang Awal (Rp)',
    // Savings
    noGoals: 'Belum ada tujuan tabungan',
    addGoal: 'Tambah Tujuan',
    goalName: 'Nama Tujuan',
    targetAmount: 'Target (Rp, opsional)',
    targetDate: 'Target Tanggal (opsional)',
    balance: 'Saldo',
    deposit: 'Setor',
    withdraw: 'Tarik',
    depositToGoal: 'Setor ke Tujuan',
    withdrawFromGoal: 'Tarik dari Tujuan',
    amount: 'Jumlah (Rp)',
    note: 'Catatan (opsional)',
    goalsTab: 'Tujuan',
    monthlyTab: 'Bulanan',
    withdrawalsTab: 'Penarikan',
    totalBalance: 'Total Saldo',
    totalTarget: 'Total Target',
    activeGoals: 'Tujuan Aktif',
    monthlyRecap: 'Rekap Tabungan Bulanan',
    withdrawalLog: 'Log Penarikan',
    noWithdrawals: 'Belum ada penarikan',
    noMonthlyData: 'Belum ada data tabungan',
    confirmDeleteTx: 'Hapus transaksi ini?',
    done: 'Selesai',
  },
}

type Translations = typeof translations.en

const LangContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
}>({
  lang: 'id',
  setLang: () => {},
  t: translations.id,
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'id'
    const stored = localStorage.getItem('lang') as Lang | null
    return stored === 'en' || stored === 'id' ? stored : 'id'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
