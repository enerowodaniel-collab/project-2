import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../lib/store';
import { CURRENCIES } from '../types';
import { AnimatedCounter, ProgressRing, SlideInView } from '../components/UI';
import { useConfetti } from '../components/Confetti';
import { Plus, Target, Trash2, Edit2, TrendingUp, Calendar, PiggyBank } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export function SavingsGoals() {
  const { savingsGoals, preferences, totalSavings, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, addToSavingsGoal } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const { showConfetti } = useConfetti();

  const currencySymbol = CURRENCIES.find((c) => c.code === preferences?.currency)?.symbol || '$';

  const handleAddToGoal = async (goalId: string) => {
    if (!addAmount || parseFloat(addAmount) <= 0) return;

    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const amount = parseFloat(addAmount);
    const wasCompleted = goal.is_completed;

    await addToSavingsGoal(goalId, amount);
    setAddAmount('');
    setEditingGoal(null);

    // Check if goal just completed
    if (!wasCompleted && goal.current_amount + amount >= goal.target_amount) {
      showConfetti({ count: 100 });
    }
  };

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
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
              Savings Goals
            </h1>
            <p className="text-surface-500 text-sm mt-1">
              Total Saved: {currencySymbol}{totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </motion.header>

        {/* Goals Grid */}
        {savingsGoals.length === 0 ? (
          <div className="empty-state card py-16">
            <div className="empty-state-icon">
              <Target className="w-8 h-8 text-surface-400" />
            </div>
            <p className="text-surface-500 font-medium">No savings goals yet</p>
            <p className="text-sm text-surface-400 mt-1">
              Create your first goal to start saving
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="btn-primary mt-4"
            >
              <Plus className="w-4 h-4" />
              Create Goal
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {savingsGoals.map((goal, index) => {
              const progress = (goal.current_amount / goal.target_amount) * 100;
              const remaining = goal.target_amount - goal.current_amount;
              const daysRemaining = goal.deadline
                ? differenceInDays(new Date(goal.deadline), new Date())
                : null;

              return (
                <SlideInView key={goal.id} delay={index * 0.1}>
                  <motion.div
                    layout
                    className={`card p-5 ${goal.is_completed ? 'border-success-500' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <ProgressRing
                        progress={Math.min(progress, 100)}
                        size={70}
                        strokeWidth={6}
                        color={goal.is_completed ? '#10b981' : goal.color}
                      >
                        <div className="text-center">
                          <span className="text-sm font-bold text-surface-900 dark:text-surface-50">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </ProgressRing>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                              {goal.name}
                            </h3>
                            {goal.deadline && (
                              <p className="text-xs text-surface-500 flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                {daysRemaining !== null && daysRemaining > 0
                                  ? `${daysRemaining} days left`
                                  : goal.is_completed
                                  ? 'Completed!'
                                  : 'Deadline passed'}
                              </p>
                            )}
                          </div>
                          {goal.is_completed && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-2 py-1 rounded-full bg-success-100 dark:bg-success-900/30"
                            >
                              <TrendingUp className="w-4 h-4 text-success-500" />
                            </motion.div>
                          )}
                        </div>

                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-lg font-bold text-surface-900 dark:text-surface-50">
                            {currencySymbol}{goal.current_amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                          </span>
                          <span className="text-surface-500 text-sm">
                            / {currencySymbol}{goal.target_amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                          </span>
                        </div>

                        {/* Add Amount */}
                        {editingGoal === goal.id ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex gap-2"
                          >
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                                {currencySymbol}
                              </span>
                              <input
                                type="number"
                                value={addAmount}
                                onChange={(e) => setAddAmount(e.target.value)}
                                placeholder="0"
                                className="input pl-7 h-10"
                                autoFocus
                              />
                            </div>
                            <button
                              onClick={() => handleAddToGoal(goal.id)}
                              className="btn-primary h-10"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => {
                                setEditingGoal(null);
                                setAddAmount('');
                              }}
                              className="btn-ghost h-10"
                            >
                              Cancel
                            </button>
                          </motion.div>
                        ) : (
                          <div className="flex gap-2">
                            {!goal.is_completed && (
                              <button
                                onClick={() => setEditingGoal(goal.id)}
                                className="btn-secondary text-sm py-2"
                              >
                                <PiggyBank className="w-4 h-4" />
                                Add Savings
                              </button>
                            )}
                            <button
                              onClick={() => deleteSavingsGoal(goal.id)}
                              className="btn-ghost text-error-500 ml-auto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </SlideInView>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddGoalModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddModal(true)}
        className="fab"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}

function AddGoalModal({ onClose }: { onClose: () => void }) {
  const { preferences, addSavingsGoal } = useStore();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#10B981');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencySymbol = CURRENCIES.find((c) => c.code === preferences?.currency)?.symbol || '$';

  const colors = [
    '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
    '#EC4899', '#EF4444', '#06B6D4', '#84CC16',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || parseFloat(targetAmount) <= 0) return;

    setIsSubmitting(true);
    try {
      await addSavingsGoal({
        name,
        target_amount: parseFloat(targetAmount),
        current_amount: 0,
        deadline: deadline || null,
        color,
        icon: 'target',
        milestone_percentage: 0,
        is_completed: false,
      });
      onClose();
    } catch (error) {
      console.error('Failed to create goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            New Savings Goal
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
            <label className="label">Goal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Vacation Fund"
              className="input"
              autoFocus
            />
          </div>

          <div>
            <label className="label">Target Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-lg font-medium">
                {currencySymbol}
              </span>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0.00"
                className="input pl-8"
              />
            </div>
          </div>

          <div>
            <label className="label">Deadline (optional)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input"
            />
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-xl transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-surface-400' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name || !targetAmount || parseFloat(targetAmount) <= 0 || isSubmitting}
            className="btn-primary w-full py-4"
          >
            <Target className="w-5 h-5" />
            {isSubmitting ? 'Creating...' : 'Create Goal'}
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
