import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../lib/store';
import { useTheme } from '../lib/theme';
import { CURRENCIES, CATEGORIES, ACHIEVEMENT_DEFINITIONS } from '../types';
import { AnimatedCounter, ProgressRing, SlideInView } from '../components/UI';
import { LevelBadge, XPProgress } from '../components/LevelBadge';
import { useConfetti } from '../components/Confetti';
import {
  Settings,
  Palette,
  DollarSign,
  Bell,
  Shield,
  Award,
  Trophy,
  Flame,
  Star,
  Crown,
  CreditCard,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  RefreshCw,
  Trash2,
  Plus,
  ExternalLink,
} from 'lucide-react';

export function Profile() {
  const {
    preferences,
    gamificationStats,
    achievements,
    subscriptions,
    updatePreferences,
    addSubscription,
    deleteSubscription,
  } = useStore();
  const { theme, setTheme } = useTheme();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const currencySymbol = CURRENCIES.find((c) => c.code === preferences?.currency)?.symbol || '$';
  const { showConfetti } = useConfetti();

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ] as const;

  // Calculate level progress
  const levelProgress = gamificationStats
    ? ((gamificationStats.total_xp % 100) / 100) * 100
    : 0;

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
            Profile
          </h1>
        </motion.header>

        {/* Level & XP Card */}
        {gamificationStats && (
          <SlideInView>
            <div className="card p-6 mb-6">
              <div className="flex items-center gap-6 mb-4">
                <ProgressRing
                  progress={levelProgress}
                  size={80}
                  strokeWidth={6}
                  color="#8b5cf6"
                >
                  <div className="text-center">
                    <Crown className="w-5 h-5 mx-auto text-accent-500" />
                    <AnimatedCounter
                      value={gamificationStats.current_level}
                      className="text-lg font-bold text-surface-900 dark:text-surface-50"
                    />
                  </div>
                </ProgressRing>
                <div className="flex-1">
                  <p className="text-surface-500 text-sm">Total XP</p>
                  <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                    {gamificationStats.total_xp.toLocaleString()}
                  </p>
                  <XPProgress currentXP={gamificationStats.total_xp} level={gamificationStats.current_level} />
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                <div className="text-center">
                  <Flame className="w-5 h-5 mx-auto mb-1 text-warning-500" />
                  <p className="text-lg font-bold text-surface-900 dark:text-surface-50">
                    {gamificationStats.current_streak}
                  </p>
                  <p className="text-xs text-surface-500">Day Streak</p>
                </div>
                <div className="text-center">
                  <Trophy className="w-5 h-5 mx-auto mb-1 text-warning-500" />
                  <p className="text-lg font-bold text-surface-900 dark:text-surface-50">
                    {gamificationStats.longest_streak}
                  </p>
                  <p className="text-xs text-surface-500">Best Streak</p>
                </div>
                <div className="text-center">
                  <Award className="w-5 h-5 mx-auto mb-1 text-accent-500" />
                  <p className="text-lg font-bold text-surface-900 dark:text-surface-50">
                    {achievements.length}
                  </p>
                  <p className="text-xs text-surface-500">Badges</p>
                </div>
              </div>
            </div>
          </SlideInView>
        )}

        {/* Achievements Section */}
        <SlideInView delay={0.1}>
          <div className="card p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                Achievements
              </h2>
              <span className="text-sm text-surface-500">
                {achievements.length} / {ACHIEVEMENT_DEFINITIONS.length}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {ACHIEVEMENT_DEFINITIONS.slice(0, 8).map((achievement) => {
                const earned = achievements.find((a) => a.achievement_id === achievement.id);

                return (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: earned ? 1.05 : 1 }}
                    className={`relative flex flex-col items-center p-3 rounded-xl ${
                      earned
                        ? 'bg-gradient-to-br from-warning-100 to-accent-100 dark:from-warning-900/20 dark:to-accent-900/20'
                        : 'bg-surface-100 dark:bg-surface-800'
                    }`}
                    style={{ opacity: earned ? 1 : 0.5 }}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                        earned
                          ? 'bg-gradient-to-br from-warning-400 to-accent-500 text-white'
                          : 'bg-surface-200 dark:bg-surface-700 text-surface-400'
                      }`}
                    >
                      {earned ? (
                        <Star className="w-5 h-5" />
                      ) : (
                        <Star className="w-5 h-5" />
                      )}
                    </div>
                    <p className="text-xs font-medium text-center text-surface-700 dark:text-surface-300 truncate w-full">
                      {achievement.name}
                    </p>
                    {earned && (
                      <p className="text-[10px] text-primary-500 mt-1">
                        +{achievement.xp} XP
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </SlideInView>

        {/* Subscriptions */}
        <SlideInView delay={0.2}>
          <div className="card p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                Subscriptions
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSubscriptionModal(true)}
                className="text-primary-500"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>

            {subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-10 h-10 mx-auto text-surface-300 dark:text-surface-600 mb-2" />
                <p className="text-surface-500">No subscriptions tracked</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSubscriptionModal(true)}
                  className="btn-secondary mt-3 text-sm"
                >
                  Add Subscription
                </motion.button>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-surface-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-surface-900 dark:text-surface-50">
                        {sub.name}
                      </p>
                      <p className="text-sm text-surface-500">
                        Next: {new Date(sub.next_billing_date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-semibold text-surface-900 dark:text-surface-50">
                      {currencySymbol}{sub.amount}
                      <span className="text-xs text-surface-500 font-normal">
                        /{sub.billing_cycle}
                      </span>
                    </p>
                    <button
                      onClick={() => deleteSubscription(sub.id)}
                      className="text-surface-400 hover:text-error-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}

                {/* Monthly Total */}
                <div className="pt-3 border-t border-surface-200 dark:border-surface-700">
                  <div className="flex justify-between">
                    <span className="text-surface-500">Monthly Total</span>
                    <span className="font-semibold text-surface-900 dark:text-surface-50">
                      {currencySymbol}
                      {subscriptions
                        .reduce((sum, s) => {
                          if (s.billing_cycle === 'monthly') return sum + s.amount;
                          if (s.billing_cycle === 'yearly') return sum + s.amount / 12;
                          if (s.billing_cycle === 'weekly') return sum + s.amount * 4;
                          return sum;
                        }, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SlideInView>

        {/* Settings */}
        <SlideInView delay={0.3}>
          <div className="card divide-y divide-surface-200 dark:divide-surface-700">
            {/* Theme */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-accent-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-surface-900 dark:text-surface-50">Theme</p>
                  <p className="text-sm text-surface-500">Choose your preferred appearance</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setTheme(opt.id)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        theme === opt.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-surface-200 dark:border-surface-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1 text-surface-600 dark:text-surface-400" />
                      <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
                        {opt.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Currency */}
            <button
              onClick={() => setShowCurrencyModal(true)}
              className="w-full p-4 flex items-center gap-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-surface-900 dark:text-surface-50">Currency</p>
                <p className="text-sm text-surface-500">
                  {preferences?.currency} ({currencySymbol})
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-surface-400" />
            </button>
          </div>
        </SlideInView>

        {/* App Info */}
        <SlideInView delay={0.4}>
          <div className="card p-4 mt-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-3">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Crown className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            <p className="font-bold text-surface-900 dark:text-surface-50">FinanceFlow</p>
            <p className="text-sm text-surface-500">Version 1.0.0</p>
          </div>
        </SlideInView>
      </div>

      {/* Currency Modal */}
      <AnimatePresence>
        {showCurrencyModal && (
          <CurrencySelectModal
            onClose={() => setShowCurrencyModal(false)}
            currentCurrency={preferences?.currency || 'USD'}
          />
        )}
      </AnimatePresence>

      {/* Subscription Modal */}
      <AnimatePresence>
        {showSubscriptionModal && (
          <AddSubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CurrencySelectModal({
  onClose,
  currentCurrency,
}: {
  onClose: () => void;
  currentCurrency: string;
}) {
  const { updatePreferences } = useStore();
  const [selected, setSelected] = useState(currentCurrency);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (selected === currentCurrency) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const currency = CURRENCIES.find((c) => c.code === selected);
      await updatePreferences({
        currency: selected,
        currency_symbol: currency?.symbol || '$',
      });
      onClose();
    } catch (error) {
      console.error('Failed to update currency:', error);
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
            Select Currency
          </h2>
          <button onClick={onClose} className="btn-ghost">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 max-h-[50vh] overflow-y-auto">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelected(c.code)}
              className={`p-3 rounded-xl border-2 transition-all ${
                selected === c.code
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-surface-200 dark:border-surface-700'
              }`}
            >
              <span className="text-lg font-bold mr-2">{c.symbol}</span>
              <span className="text-sm text-surface-700 dark:text-surface-300">
                {c.code}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="btn-primary w-full py-4"
        >
          {isSubmitting ? 'Saving...' : 'Save Currency'}
        </button>
      </motion.div>
    </motion.div>
  );
}

function AddSubscriptionModal({ onClose }: { onClose: () => void }) {
  const { preferences, addSubscription } = useStore();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'weekly'>('monthly');
  const [nextBilling, setNextBilling] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencySymbol = CURRENCIES.find((c) => c.code === preferences?.currency)?.symbol || '$';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    setIsSubmitting(true);
    try {
      await addSubscription({
        name,
        amount: parseFloat(amount),
        billing_cycle: billingCycle,
        next_billing_date: nextBilling,
        category: 'subscription',
        is_active: true,
        logo_url: null,
      });
      onClose();
    } catch (error) {
      console.error('Failed to add subscription:', error);
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
            Add Subscription
          </h2>
          <button onClick={onClose} className="btn-ghost">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Service Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Netflix, Spotify"
              className="input"
            />
          </div>

          <div>
            <label className="label">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400">
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
          </div>

          <div>
            <label className="label">Billing Cycle</label>
            <div className="grid grid-cols-3 gap-2">
              {(['weekly', 'monthly', 'yearly'] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`p-3 rounded-xl font-medium transition-all ${
                    billingCycle === cycle
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
                  }`}
                >
                  {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Next Billing Date</label>
            <input
              type="date"
              value={nextBilling}
              onChange={(e) => setNextBilling(e.target.value)}
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={!name || !amount || isSubmitting}
            className="btn-primary w-full py-4"
          >
            <CreditCard className="w-5 h-5" />
            {isSubmitting ? 'Adding...' : 'Add Subscription'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
