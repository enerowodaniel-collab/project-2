import { motion } from 'framer-motion';
import { useStore } from '../lib/store';
import { CURRENCIES, CATEGORIES } from '../types';
import { format } from 'date-fns';

export function BudgetOverview() {
  const { budgets, transactions, preferences } = useStore();
  const currencySymbol = CURRENCIES.find((c) => c.code === preferences?.currency)?.symbol || '$';

  const activeBudgets = budgets.filter((b) => b.is_active);

  if (activeBudgets.length === 0) return null;

  // Calculate spending for each budget
  const budgetsWithSpending = activeBudgets.map((budget) => {
    const startDate = new Date(budget.start_date);
    const endDate = new Date(budget.end_date);

    const spending = transactions
      .filter((t) => {
        const txDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          t.category === budget.category &&
          txDate >= startDate &&
          txDate <= endDate
        );
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const percentage = (spending / budget.amount) * 100;
    const isOverBudget = percentage > 100;

    return {
      ...budget,
      spending,
      percentage: Math.min(percentage, 100),
      isOverBudget,
      remaining: budget.amount - spending,
    };
  });

  return (
    <div className="card p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
          Budgets
        </h2>
        <span className="text-sm text-surface-500">
          {format(new Date(), 'MMM d')} - {format(new Date(budgetsWithSpending[0]?.end_date || new Date()), 'MMM d')}
        </span>
      </div>

      <div className="space-y-4">
        {budgetsWithSpending.map((budget, index) => {
          const category = CATEGORIES.find((c) => c.name === budget.category);
          const color = category?.color || '#94a3b8';

          return (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-surface-900 dark:text-surface-50">
                    {category?.label || budget.category}
                  </span>
                </div>
                <span className={`text-sm font-medium ${budget.isOverBudget ? 'text-error-500' : 'text-surface-500'}`}>
                  {currencySymbol}{budget.spending.toFixed(0)} / {currencySymbol}{budget.amount.toFixed(0)}
                </span>
              </div>
              <div className="progress h-2">
                <motion.div
                  className={`h-full rounded-full transition-colors ${budget.isOverBudget ? 'bg-error-500' : ''}`}
                  style={{ backgroundColor: budget.isOverBudget ? undefined : color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${budget.percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-surface-500">
                  {budget.remaining >= 0
                    ? `${currencySymbol}${budget.remaining.toFixed(0)} remaining`
                    : `${currencySymbol}${Math.abs(budget.remaining).toFixed(0)} over budget`}
                </span>
                <span className="text-xs text-surface-500 capitalize">{budget.period}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
