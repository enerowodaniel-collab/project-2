import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../lib/store';
import { CURRENCIES, CATEGORIES } from '../types';
import { AnimatedCounter, ProgressRing, SlideInView } from '../components/UI';
import { Plus, PieChart, Trash2, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays, differenceInDays } from 'date-fns';

export function Budgets() {
  const { budgets, transactions, preferences, addBudget, updateBudget, deleteBudget } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const currencySymbol = CURRENCIES.find((c) => c.code === preferences?.currency)?.symbol || '$';

  // Get current period date range
  const now = new Date();
  const currentPeriodStart = period === 'weekly'
    ? startOfWeek(now, { weekStartsOn: 0 })
    : startOfMonth(now);
  const currentPeriodEnd = period === 'weekly'
    ? endOfWeek(now, { weekStartsOn: 0 })
    : endOfMonth(now);

  // Filter budgets for current period
  const currentBudgets = budgets.filter((b) => b.is_active);

  // Calculate spending for each budget
  const budgetsWithSpending = currentBudgets.map((budget) => {
    const spending = transactions
      .filter((t) => {
        const txDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          t.category === budget.category &&
          txDate >= new Date(budget.start_date) &&
          txDate <= new Date(budget.end_date)
        );
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const percentage = budget.amount > 0 ? (spending / budget.amount) * 100 : 0;
    const remaining = budget.amount - spending;
    const dailyRemaining = Math.ceil(differenceInDays(new Date(budget.end_date), now));
    const dailyBudget = dailyRemaining > 0 ? remaining / dailyRemaining : 0;

    return {
      ...budget,
      spending,
      percentage: Math.min(percentage, 100),
      remaining,
      isOverBudget: remaining < 0,
      dailyBudget: Math.max(0, dailyBudget),
      daysRemaining: Math.max(0, dailyRemaining),
    };
  });

  // Overall budget stats
  const totalBudget = budgetsWithSpending.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgetsWithSpending.reduce((sum, b) => sum + b.spending, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="page">
      <div className="page-wide">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            Budgets
          </h1>
          <p className="text-surface-500 text-sm mt-1">
            {format(currentPeriodStart, 'MMM d')} - {format(currentPeriodEnd, 'MMM d, yyyy')}
          </p>
        </motion.header>

        {/* Period Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setPeriod('weekly')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              period === 'weekly'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              period === 'monthly'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Overall Summary */}
        <SlideInView>
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-6">
              <ProgressRing
                progress={Math.min(overallPercentage, 100)}
                size={100}
                strokeWidth={10}
                color={overallPercentage > 100 ? '#ef4444' : overallPercentage > 80 ? '#f59e0b' : '#10b981'}
              >
                <div className="text-center">
                  <AnimatedCounter
                    value={Math.min(overallPercentage, 100)}
                    decimals={0}
                    suffix="%"
                    className="text-xl font-bold text-surface-900 dark:text-surface-50"
                  />
                </div>
              </ProgressRing>
              <div className="flex-1">
                <p className="text-surface-500 text-sm mb-1">Overall Spending</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2">
                  {currencySymbol}{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  <span className="text-sm font-normal text-surface-500">
                    {' '}of {currencySymbol}{totalBudget.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  {overallPercentage <= 100 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-success-500" />
                      <span className="text-sm text-success-500 font-medium">
                        {currencySymbol}{(totalBudget - totalSpent).toLocaleString(undefined, { minimumFractionDigits: 0 })} remaining
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-error-500" />
                      <span className="text-sm text-error-500 font-medium">
                        {currencySymbol}{Math.abs(totalBudget - totalSpent).toLocaleString(undefined, { minimumFractionDigits: 0 })} over budget
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SlideInView>

        {/* Budget Cards */}
        {budgetsWithSpending.length === 0 ? (
          <div className="empty-state card py-16">
            <div className="empty-state-icon">
              <PieChart className="w-8 h-8 text-surface-400" />
            </div>
            <p className="text-surface-500 font-medium">No budgets set</p>
            <p className="text-sm text-surface-400 mt-1">
              Create budgets to track your spending limits
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="btn-primary mt-4"
            >
              <Plus className="w-4 h-4" />
              Create Budget
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {budgetsWithSpending.map((budget, index) => {
              const category = CATEGORIES.find((c) => c.name === budget.category);
              const color = category?.color || '#94a3b8';

              return (
                <SlideInView key={budget.id} delay={index * 0.1}>
                  <div className={`card p-5 ${budget.isOverBudget ? 'border-error-500' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: color + '20' }}
                        >
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                            {category?.label || budget.category}
                          </h3>
                          <p className="text-xs text-surface-500">
                            {budget.daysRemaining} days remaining
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteBudget(budget.id)}
                        className="btn-ghost text-error-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-surface-500">
                          {currencySymbol}{budget.spending.toFixed(0)} spent
                        </span>
                        <span className={budget.isOverBudget ? 'text-error-500 font-medium' : 'text-surface-500'}>
                          {currencySymbol}{budget.amount.toFixed(0)} budget
                        </span>
                      </div>
                      <div className="progress h-3">
                        <motion.div
                          className={`h-full rounded-full transition-colors ${budget.isOverBudget ? 'bg-error-500' : ''}`}
                          style={{ backgroundColor: budget.isOverBudget ? undefined : color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${budget.percentage}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-surface-200 dark:border-surface-700">
                      <div>
                        <p className="text-xs text-surface-500">Remaining</p>
                        <p className={`font-semibold ${budget.remaining >= 0 ? 'text-success-500' : 'text-error-500'}`}>
                          {currencySymbol}{Math.abs(budget.remaining).toFixed(0)}
                          {budget.remaining < 0 && ' over'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-surface-500">Daily Budget</p>
                        <p className="font-semibold text-surface-900 dark:text-surface-50">
                          {currencySymbol}{budget.dailyBudget.toFixed(0)}/day
                        </p>
                      </div>
                    </div>
                  </div>
                </SlideInView>
              );
            })}
          </div>
        )}

        {/* Add Budget Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="card w-full p-4 flex items-center justify-center gap-2 text-surface-500 hover:text-primary-500 transition-colors mt-4"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Budget</span>
        </motion.button>
      </div>

      {/* Add Budget Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddBudgetModal onClose={() => setShowAddModal(false)} period={period} />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddBudgetModal({ onClose, period }: { onClose: () => void; period: 'weekly' | 'monthly' }) {
  const { preferences, addBudget } = useStore();
  const [category, setCategory] = useState('food');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencySymbol = CURRENCIES.find((c) => c.code === preferences?.currency)?.symbol || '$';

  const expenseCategories = CATEGORIES.filter((c) => c.type === 'expense');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const startDate = period === 'weekly'
        ? startOfWeek(now, { weekStartsOn: 0 })
        : startOfMonth(now);
      const endDate = period === 'weekly'
        ? endOfWeek(now, { weekStartsOn: 0 })
        : endOfMonth(now);

      await addBudget({
        category,
        amount: parseFloat(amount),
        period,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        is_active: true,
      });
      onClose();
    } catch (error) {
      console.error('Failed to create budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedAmounts = {
    food: [50, 100, 150, 200],
    transport: [30, 50, 75, 100],
    entertainment: [25, 50, 75, 100],
    shopping: [50, 100, 200, 300],
  };

  const suggestions = suggestedAmounts[category as keyof typeof suggestedAmounts] || [50, 100, 150, 200];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bottom-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">
            New {period === 'weekly' ? 'Weekly' : 'Monthly'} Budget
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {expenseCategories.slice(0, 9).map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    category === cat.name
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-surface-200 dark:border-surface-700'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs font-medium text-surface-900 dark:text-surface-50">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Budget Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-lg font-medium">
                {currencySymbol}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input pl-8"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {suggestions.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className="flex-1 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                >
                  {currencySymbol}{amt}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
            className="btn-primary w-full py-4"
          >
            <PieChart className="w-5 h-5" />
            {isSubmitting ? 'Creating...' : 'Create Budget'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
