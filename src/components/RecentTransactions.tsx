import { motion } from 'framer-motion';
import { useStore } from '../lib/store';
import { CURRENCIES, CATEGORIES } from '../types';
import { ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

export function RecentTransactions() {
  const { transactions, preferences } = useStore();
  const currencySymbol = CURRENCIES.find((c) => c.code === preferences?.currency)?.symbol || '$';

  const recentTransactions = transactions.slice(0, 6);

  const groupedTransactions = recentTransactions.reduce((groups, tx) => {
    const date = new Date(tx.date);
    let label: string;
    if (isToday(date)) label = 'Today';
    else if (isYesterday(date)) label = 'Yesterday';
    else if (isThisWeek(date)) label = 'This Week';
    else label = format(date, 'MMMM d');

    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
    return groups;
  }, {} as Record<string, typeof transactions>);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
          Recent Transactions
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

      {recentTransactions.length === 0 ? (
        <div className="empty-state py-8">
          <div className="empty-state-icon">
            <ArrowUpRight className="w-8 h-8 text-surface-400" />
          </div>
          <p className="text-surface-500">No transactions yet</p>
          <p className="text-sm text-surface-400 mt-1">Add your first transaction to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTransactions).map(([date, txs]) => (
            <div key={date}>
              <p className="text-xs font-medium text-surface-500 mb-2">{date}</p>
              <div className="space-y-2">
                {txs.map((tx, index) => {
                  const category = CATEGORIES.find((c) => c.name === tx.category) || CATEGORIES[CATEGORIES.length - 1];
                  const isIncome = tx.type === 'income';

                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-900 dark:text-surface-50 truncate">
                          {tx.description || category.label}
                        </p>
                        <p className="text-sm text-surface-500">{category.label}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${isIncome ? 'text-success-500' : 'text-surface-900 dark:text-surface-50'}`}>
                          {isIncome ? '+' : '-'}{currencySymbol}
                          {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
