import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../lib/store';
import { CURRENCIES, CATEGORIES } from '../types';
import { X, Check, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface AddTransactionModalProps {
  onClose: () => void;
  editTransaction?: {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string | null;
    date: string;
  };
}

export function AddTransactionModal({ onClose, editTransaction }: AddTransactionModalProps) {
  const { preferences, addTransaction, updateTransaction } = useStore();
  const [type, setType] = useState<'income' | 'expense'>(editTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '');
  const [category, setCategory] = useState(editTransaction?.category || 'food');
  const [description, setDescription] = useState(editTransaction?.description || '');
  const [date, setDate] = useState(editTransaction?.date || format(new Date(), 'yyyy-MM-dd'));
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencySymbol = CURRENCIES.find((c) => c.code === preferences?.currency)?.symbol || '$';

  const categories = CATEGORIES.filter(
    (c) => c.type === type || c.type === 'both'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      const transactionData = {
        type,
        amount: parseFloat(amount),
        category,
        description: description || null,
        date,
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? recurringFrequency : null,
      };

      if (editTransaction) {
        await updateTransaction(editTransaction.id, transactionData);
      } else {
        await addTransaction(transactionData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = type === 'expense'
    ? [10, 25, 50, 100]
    : [500, 1000, 2000, 5000];

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
        className="bottom-sheet max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">
            {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('food');
              }}
              className={`p-4 rounded-xl font-medium transition-all ${
                type === 'expense'
                  ? 'bg-error-500 text-white'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
              }`}
            >
              <ArrowDownRight className="w-5 h-5 mx-auto mb-1" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('salary');
              }}
              className={`p-4 rounded-xl font-medium transition-all ${
                type === 'income'
                  ? 'bg-success-500 text-white'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
              }`}
            >
              <ArrowUpRight className="w-5 h-5 mx-auto mb-1" />
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="label">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-lg font-medium">
                {currencySymbol}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="input pl-8 text-2xl font-semibold h-14"
                autoFocus
              />
            </div>
            <div className="flex gap-2 mt-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className="flex-1 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                >
                  {currencySymbol}{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    category === cat.name
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs font-medium text-surface-900 dark:text-surface-50">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note..."
              className="input"
            />
          </div>

          {/* Date */}
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </div>

          {/* Recurring */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-surface-400" />
              <span className="font-medium text-surface-900 dark:text-surface-50">
                Recurring
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                isRecurring ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'
              }`}
            >
              <motion.div
                className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-1"
                animate={{ left: isRecurring ? '26px' : '4px' }}
              />
            </button>
          </div>

          {isRecurring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRecurringFrequency('weekly')}
                  className={`p-3 rounded-xl font-medium transition-all ${
                    recurringFrequency === 'weekly'
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
                  }`}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setRecurringFrequency('monthly')}
                  className={`p-3 rounded-xl font-medium transition-all ${
                    recurringFrequency === 'monthly'
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </motion.div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
            className="btn-primary w-full py-4"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Check className="w-5 h-5" />
              </motion.div>
            ) : (
              <>
                <Check className="w-5 h-5" />
                {editTransaction ? 'Save Changes' : 'Add Transaction'}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ArrowDownRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7l10 10M17 7v10H7" />
    </svg>
  );
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}
