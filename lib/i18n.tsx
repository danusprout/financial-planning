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
