import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../lib/store';
import { CURRENCIES, CATEGORIES } from '../types';
import { SlideInView } from '../components/UI';
import { ChevronLeft, ChevronRight, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';

export function Calendar() {
  const { transactions, preferences } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const currencySymbol = CURRENCIES.find((c) => c.code === preferences?.currency)?.symbol || '$';

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Group transactions by date
  const transactionsByDate = useMemo(() => {
    const grouped: Record<string, typeof transactions> = {};

    transactions.forEach((tx) => {
      const dateKey = tx.date;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(tx);
    });

    return grouped;
  }, [transactions]);

  // Get daily totals
  const getDailyData = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayTransactions = transactionsByDate[dateKey] || [];

    const income = dayTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = dayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expenses, net: income - expenses, count: dayTransactions.length };
  };

  // Selected day data
  const selectedTransactions = selectedDate
    ? transactionsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
            Calendar
          </h1>
        </motion.header>

        {/* Month Navigation */}
        <SlideInView>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-surface-600 dark:text-surface-400" />
            </button>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-surface-600 dark:text-surface-400" />
            </button>
          </div>
        </SlideInView>

        {/* Calendar Grid */}
        <SlideInView delay={0.1}>
          <div className="card p-4 mb-6">
            {/* Week headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-surface-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayData = getDailyData(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const hasTransactions = dayData.count > 0;

                return (
                  <motion.button
                    key={day.toISOString()}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.005 }}
                    onClick={() => setSelectedDate(day)}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-primary-500 text-white'
                        : isToday(day)
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : !isCurrentMonth
                        ? 'text-surface-300 dark:text-surface-600'
                        : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                    }`}
                  >
                    <span className="text-sm font-medium">{format(day, 'd')}</span>
                    {hasTransactions && (
                      <div className="flex gap-0.5 mt-1">
                        {dayData.income > 0 && (
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-success-500'}`}
                          />
                        )}
                        {dayData.expenses > 0 && (
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-error-500'}`}
                          />
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </SlideInView>

        {/* Selected Day Details */}
        {selectedDate && (
          <SlideInView delay={0.2}>
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                    {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}
                  </h3>
                  <p className="text-sm text-surface-500">
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </p>
                </div>
                {selectedTransactions.length > 0 && (
                  <div className="text-right">
                    {(() => {
                      const data = getDailyData(selectedDate);
                      return (
                        <div className="space-y-1">
                          {data.income > 0 && (
                            <p className="text-sm text-success-500">
                              +{currencySymbol}{data.income.toFixed(2)}
                            </p>
                          )}
                          {data.expenses > 0 && (
                            <p className="text-sm text-error-500">
                              -{currencySymbol}{data.expenses.toFixed(2)}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {selectedTransactions.length === 0 ? (
                <div className="empty-state py-8">
                  <p className="text-surface-500">No transactions on this day</p>
                </div>
              ) : (
                <div className="divide-y divide-surface-200 dark:divide-surface-700">
                  {selectedTransactions.map((tx) => {
                    const category = CATEGORIES.find((c) => c.name === tx.category) || CATEGORIES[CATEGORIES.length - 1];
                    const isIncome = tx.type === 'income';

                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 py-3"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
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
                        <p className={`font-semibold flex-shrink-0 ${isIncome ? 'text-success-500' : 'text-surface-900 dark:text-surface-50'}`}>
                          {isIncome ? '+' : '-'}{currencySymbol}
                          {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </SlideInView>
        )}

        {/* Monthly Summary */}
        <SlideInView delay={0.3}>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {(() => {
              const monthTransactions = transactions.filter((t) => {
                const txDate = new Date(t.date);
                return isSameMonth(txDate, currentMonth);
              });

              const income = monthTransactions
                .filter((t) => t.type === 'income')
                .reduce((sum, t) => sum + Number(t.amount), 0);

              const expenses = monthTransactions
                .filter((t) => t.type === 'expense')
                .reduce((sum, t) => sum + Number(t.amount), 0);

              const avgDaily = expenses / calendarDays.filter((d) => isSameMonth(d, currentMonth) && d <= new Date()).length;

              return [
                { label: 'Income', value: income, color: 'success' },
                { label: 'Expenses', value: expenses, color: 'error' },
                { label: 'Avg/Day', value: avgDaily || 0, color: 'primary' },
              ].map((stat) => (
                <div key={stat.label} className="card p-4 text-center">
                  <p className="text-xs text-surface-500 mb-1">{stat.label}</p>
                  <p className={`text-lg font-bold ${stat.color === 'success' ? 'text-success-500' : stat.color === 'error' ? 'text-error-500' : 'text-surface-900 dark:text-surface-50'}`}>
                    {currencySymbol}{stat.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              ));
            })()}
          </div>
        </SlideInView>
      </div>
    </div>
  );
}
