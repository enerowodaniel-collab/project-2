import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../lib/store';
import { CURRENCIES, CATEGORIES } from '../types';
import { AnimatedCounter, SlideInView } from '../components/UI';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { Plus, Filter, Search, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek, isThisMonth, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expenses' },
];

const timeFilters = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: 'all', label: 'All Time' },
];

export function Transactions() {
  const { transactions, preferences } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const currencySymbol = CURRENCIES.find((c) => c.code === preferences?.currency)?.symbol || '$';

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Type filter
    if (filter !== 'all' && tx.type !== filter) return false;

    // Time filter
    const txDate = new Date(tx.date);
    const now = new Date();
    if (timeFilter === 'week') {
      if (!isThisWeek(txDate)) return false;
    } else if (timeFilter === 'month') {
      if (!isThisMonth(txDate)) return false;
    } else if (timeFilter === '3months') {
      const threeMonthsAgo = subMonths(now, 3);
      if (txDate < threeMonthsAgo) return false;
    }

    // Category filter
    if (selectedCategory && tx.category !== selectedCategory) return false;

    // Search query
    if (searchQuery) {
      const cat = CATEGORIES.find((c) => c.name === tx.category);
      if (
        !tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !cat?.label.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
    }

    return true;
  });

  // Group by date
  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const date = new Date(tx.date);
    let label: string;
    if (isToday(date)) label = 'Today';
    else if (isYesterday(date)) label = 'Yesterday';
    else if (isThisWeek(date)) label = 'This Week';
    else label = format(date, 'MMMM d, yyyy');

    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
    return groups;
  }, {} as Record<string, typeof transactions>);

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const categories = CATEGORIES.filter((c) =>
    c.type === 'both' || c.type === filter || filter === 'all'
  );

  return (
    <div className="page">
      <div className="page-wide">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            Transactions
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="fab relative right-0 bottom-0 w-10 h-10 rounded-xl"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </motion.header>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <SlideInView>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-4 h-4 text-success-500" />
                <span className="text-sm text-surface-500">Income</span>
              </div>
              <p className="text-xl font-bold text-success-500">
                +{currencySymbol}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </SlideInView>
          <SlideInView delay={0.1}>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="w-4 h-4 text-error-500" />
                <span className="text-sm text-surface-500">Expenses</span>
              </div>
              <p className="text-xl font-bold text-error-500">
                -{currencySymbol}{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </SlideInView>
        </div>

        {/* Search */}
        <SlideInView delay={0.2}>
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-12"
            />
          </div>
        </SlideInView>

        {/* Filters */}
        <SlideInView delay={0.3}>
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filter === opt.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
            {timeFilters.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimeFilter(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  timeFilter === opt.value
                    ? 'bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SlideInView>

        {/* Categories */}
        <SlideInView delay={0.4}>
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                !selectedCategory
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.name
                    ? 'text-surface-900 dark:text-surface-50'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
                }`}
                style={{
                  backgroundColor: selectedCategory === cat.name ? cat.color + '20' : undefined,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.label}
              </button>
            ))}
          </div>
        </SlideInView>

        {/* Transaction List */}
        <div className="space-y-4">
          {Object.entries(groupedTransactions).map(([date, txs]) => (
            <SlideInView key={date}>
              <div>
                <p className="text-xs font-medium text-surface-500 mb-2">{date}</p>
                <div className="card divide-y divide-surface-200 dark:divide-surface-700">
                  {txs.map((tx, index) => {
                    const category = CATEGORIES.find((c) => c.name === tx.category) || CATEGORIES[CATEGORIES.length - 1];
                    const isIncome = tx.type === 'income';

                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center gap-3 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer"
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
            </SlideInView>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="empty-state card">
              <div className="empty-state-icon">
                <Calendar className="w-8 h-8 text-surface-400" />
              </div>
              <p className="text-surface-500">No transactions found</p>
              <p className="text-sm text-surface-400 mt-1">
                Try adjusting your filters or add a new transaction
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddModal(true)}
        className="fab"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddTransactionModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
