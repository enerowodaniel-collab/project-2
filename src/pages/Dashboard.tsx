import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../lib/store';
import { CURRENCIES } from '../types';
import { AnimatedCounter, ProgressRing, SlideInView } from '../components/UI';
import { FinancialHealthScore } from '../components/FinancialHealthScore';
import { QuickStats } from '../components/QuickStats';
import { RecentTransactions } from '../components/RecentTransactions';
import { SavingsOverview } from '../components/SavingsOverview';
import { BudgetOverview } from '../components/BudgetOverview';
import { LevelBadge } from '../components/LevelBadge';
import { ChevronRight, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const {
    preferences,
    currentBalance,
    totalIncome,
    totalExpenses,
    totalSavings,
    transactions,
    savingsGoals,
    budgets,
    gamificationStats,
  } = useStore();

  const currencySymbol = CURRENCIES.find((c) => c.code === preferences?.currency)?.symbol || '$';

  const savingsProgress = savingsGoals.length > 0
    ? (savingsGoals.reduce((sum, g) => sum + g.current_amount, 0) /
        savingsGoals.reduce((sum, g) => sum + g.target_amount, 0)) *
      100
    : 0;

  return (
    <div className="page">
      <div className="page-wide">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <p className="text-surface-500 text-sm">Welcome back</p>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
              Dashboard
            </h1>
          </div>
          {gamificationStats && <LevelBadge level={gamificationStats.current_level} xp={gamificationStats.total_xp} />}
        </motion.header>

        {/* Balance Card */}
        <SlideInView>
          <motion.div className="card-elevated p-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent" />
            <div className="relative">
              <p className="text-surface-500 dark:text-surface-400 text-sm mb-1">Current Balance</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-surface-900 dark:text-surface-50">
                  {currencySymbol}
                </span>
                <AnimatedCounter
                  value={currentBalance}
                  decimals={2}
                  className="text-4xl font-bold text-surface-900 dark:text-surface-50"
                />
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-success-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Income</p>
                    <p className="font-semibold text-surface-900 dark:text-surface-50">
                      {currencySymbol}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
                    <ArrowDownRight className="w-4 h-4 text-error-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Expenses</p>
                    <p className="font-semibold text-surface-900 dark:text-surface-50">
                      {currencySymbol}{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </SlideInView>

        {/* Financial Health Score */}
        <SlideInView delay={0.1}>
          <FinancialHealthScore />
        </SlideInView>

        {/* Quick Stats */}
        <SlideInView delay={0.2}>
          <QuickStats />
        </SlideInView>

        {/* Savings Ring */}
        {savingsGoals.length > 0 && (
          <SlideInView delay={0.3}>
            <div className="card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                  Savings Progress
                </h2>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-primary-500 text-sm font-medium flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="flex items-center gap-6">
                <ProgressRing
                  progress={Math.min(savingsProgress, 100)}
                  size={100}
                  strokeWidth={8}
                  color="#10b981"
                >
                  <div className="text-center">
                    <AnimatedCounter
                      value={savingsProgress}
                      decimals={0}
                      suffix="%"
                      className="text-xl font-bold text-surface-900 dark:text-surface-50"
                    />
                  </div>
                </ProgressRing>
                <div className="flex-1">
                  <p className="text-surface-500 text-sm mb-2">Total Saved</p>
                  <p className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-1">
                    {currencySymbol}{totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-surface-500">
                    of {currencySymbol}
                    {savingsGoals
                      .reduce((sum, g) => sum + g.target_amount, 0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
                    goal
                  </p>
                </div>
              </div>
            </div>
          </SlideInView>
        )}

        {/* Budget Overview */}
        {budgets.length > 0 && (
          <SlideInView delay={0.4}>
            <BudgetOverview />
          </SlideInView>
        )}

        {/* Recent Transactions */}
        <SlideInView delay={0.5}>
          <RecentTransactions />
        </SlideInView>
      </div>
    </div>
  );
}
