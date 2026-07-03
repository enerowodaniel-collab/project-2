import { motion } from 'framer-motion';
import { useStore } from '../lib/store';
import { CURRENCIES, CATEGORIES } from '../types';
import { PiggyBank, TrendingUp, Wallet, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AnimatedCounter } from './UI';

export function QuickStats() {
  const { preferences, transactions, savingsGoals, currentBalance } = useStore();
  const currencySymbol = CURRENCIES.find((c) => c.code === preferences?.currency)?.symbol || '$';

  // Get this month's transactions
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthTransactions = transactions.filter((t) => new Date(t.date) >= startOfMonth);

  const thisMonthIncome = thisMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const thisMonthExpenses = thisMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Get top expense category
  const categoryTotals: Record<string, number> = {};
  thisMonthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const topCategoryInfo = topCategory ? CATEGORIES.find((c) => c.name === topCategory[0]) : null;

  const stats = [
    {
      label: 'This Month Income',
      value: thisMonthIncome,
      icon: ArrowUpRight,
      color: '#10b981',
      bgColor: '#ecfdf5',
    },
    {
      label: 'This Month Expenses',
      value: thisMonthExpenses,
      icon: ArrowDownRight,
      color: '#ef4444',
      bgColor: '#fef2f2',
    },
    {
      label: 'Savings Goals',
      value: savingsGoals.length,
      isCount: true,
      icon: PiggyBank,
      color: '#3b82f6',
      bgColor: '#eff6ff',
    },
    {
      label: 'Transactions',
      value: transactions.length,
      isCount: true,
      icon: Receipt,
      color: '#8b5cf6',
      bgColor: '#faf5ff',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-4"
          >
            <div
              className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center"
              style={{ backgroundColor: stat.bgColor }}
            >
              <Icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <p className="text-xs text-surface-500 mb-1">{stat.label}</p>
            {stat.isCount ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-surface-900 dark:text-surface-50"
              >
                {stat.value}
              </motion.span>
            ) : (
              <span className="text-xl font-bold text-surface-900 dark:text-surface-50">
                {currencySymbol}
                {stat.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            )}
          </motion.div>
        );
      })}

      {/* Top Spending Category */}
      {topCategoryInfo && topCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-2 card p-4"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: topCategoryInfo.color + '20' }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: topCategoryInfo.color }}
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-surface-500">Top Spending Category</p>
              <p className="font-semibold text-surface-900 dark:text-surface-50">
                {topCategoryInfo.label}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-surface-900 dark:text-surface-50">
                {currencySymbol}
                {topCategory[1].toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
