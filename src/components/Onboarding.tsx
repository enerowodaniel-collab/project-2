import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../lib/theme';
import { useStore } from '../lib/store';
import { CURRENCIES, CATEGORIES } from '../types';
import {
  Wallet,
  ArrowRight,
  Check,
  Palette,
  DollarSign,
  Target,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import type { UserPreferences } from '../types';

const onboardingSteps = [
  { id: 'welcome', title: 'Welcome to FinanceFlow', icon: Wallet },
  { id: 'currency', title: 'Choose Your Currency', icon: DollarSign },
  { id: 'theme', title: 'Select Your Theme', icon: Palette },
  { id: 'goal', title: 'Set Your First Goal', icon: Target },
  { id: 'budget', title: 'Create Your First Budget', icon: TrendingUp },
  { id: 'complete', title: "You're All Set!", icon: Sparkles },
];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('food');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setTheme: setAppTheme } = useTheme();
  const { updatePreferences, addSavingsGoal, addBudget } = useStore();

  useEffect(() => {
    setAppTheme(theme);
  }, [theme, setAppTheme]);

  const handleNext = async () => {
    if (step === onboardingSteps.length - 2) {
      setIsSubmitting(true);
      try {
        const prefUpdates: Partial<UserPreferences> = {
          currency,
          currency_symbol: CURRENCIES.find((c) => c.code === currency)?.symbol || '$',
          theme,
          onboarding_completed: true,
          first_savings_goal_created: !!goalName && !!goalAmount,
          first_budget_created: !!budgetAmount,
        };

        await updatePreferences(prefUpdates);

        if (goalName && goalAmount) {
          await addSavingsGoal({
            name: goalName,
            target_amount: parseFloat(goalAmount),
            current_amount: 0,
            deadline: null,
            color: '#10B981',
            icon: 'target',
            milestone_percentage: 0,
            is_completed: false,
          });
        }

        if (budgetAmount) {
          const today = new Date();
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);

          await addBudget({
            category: budgetCategory,
            amount: parseFloat(budgetAmount),
            period: 'weekly',
            start_date: weekStart.toISOString().split('T')[0],
            end_date: weekEnd.toISOString().split('T')[0],
            is_active: true,
          });
        }

        setStep(step + 1);
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await updatePreferences({
        currency,
        currency_symbol: CURRENCIES.find((c) => c.code === currency)?.symbol || '$',
        theme,
        onboarding_completed: true,
      });
    } catch (error) {
      console.error('Failed to finish onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!currency;
    return true;
  };

  const currentStep = onboardingSteps[step];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-mesh overflow-hidden">
      {/* Progress indicators */}
      <div className="pt-12 pb-6 px-6">
        <div className="flex justify-center gap-2 mb-8">
          {onboardingSteps.map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.8 }}
              animate={{
                scale: idx === step ? 1 : 0.8,
                backgroundColor: idx <= step ? '#10b981' : '#e2e8f0',
              }}
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: idx === step ? 24 : 8 }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {step === 0 && (
              <WelcomeStep
                icon={StepIcon}
                title={currentStep.title}
                currency={currency}
              />
            )}

            {step === 1 && (
              <CurrencyStep
                currency={currency}
                setCurrency={setCurrency}
              />
            )}

            {step === 2 && (
              <ThemeStep
                theme={theme}
                setTheme={setTheme}
              />
            )}

            {step === 3 && (
              <GoalStep
                goalName={goalName}
                setGoalName={setGoalName}
                goalAmount={goalAmount}
                setGoalAmount={setGoalAmount}
                currency={currency}
              />
            )}

            {step === 4 && (
              <BudgetStep
                budgetCategory={budgetCategory}
                setBudgetCategory={setBudgetCategory}
                budgetAmount={budgetAmount}
                setBudgetAmount={setBudgetAmount}
                currency={currency}
              />
            )}

            {step === 5 && (
              <CompleteStep icon={StepIcon} title={currentStep.title} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      {step < onboardingSteps.length - 1 && (
        <div className="p-6 flex gap-3">
          {step > 0 && step < 3 && (
            <button
              onClick={handleSkip}
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Skip for now
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="btn-primary flex-1"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Check className="w-5 h-5" />
              </motion.div>
            ) : step === onboardingSteps.length - 2 ? (
              "Let's Go!"
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function WelcomeStep({ icon: Icon, title, currency }: { icon: typeof Wallet; title: string; currency: string }) {
  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || '$';

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg mb-8"
      >
        <Icon className="w-14 h-14 text-white" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-4"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-surface-600 dark:text-surface-400 text-lg max-w-sm mb-8"
      >
        Track your finances, set savings goals, and have fun with budget challenges.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4"
      >
        {[
          { label: 'Track', icon: TrendingUp },
          { label: 'Save', icon: Target },
          { label: 'Grow', icon: Sparkles },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + idx * 0.1 }}
            className="flex flex-col items-center p-4 rounded-2xl bg-white dark:bg-surface-900 shadow-sm"
          >
            <item.icon className="w-6 h-6 text-primary-500 mb-2" />
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              {item.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function CurrencyStep({ currency, setCurrency }: { currency: string; setCurrency: (v: string) => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2">
          Select Your Currency
        </h2>
        <p className="text-surface-600 dark:text-surface-400">
          Choose the currency you'll use for tracking finances.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3 pb-4">
          {CURRENCIES.map((c, idx) => (
            <motion.button
              key={c.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => setCurrency(c.code)}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                currency === c.code
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 hover:border-surface-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                  {c.symbol}
                </span>
                <div className="text-left">
                  <p className="font-medium text-surface-900 dark:text-surface-50">
                    {c.code}
                  </p>
                  <p className="text-sm text-surface-500">{c.name}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThemeStep({ theme, setTheme }: { theme: string; setTheme: (v: 'light' | 'dark' | 'system') => void }) {
  const themes = [
    { id: 'light', label: 'Light', description: 'Clean and bright', emoji: '☀️' },
    { id: 'dark', label: 'Dark', description: 'Easy on the eyes', emoji: '🌙' },
    { id: 'system', label: 'System', description: 'Match your device', emoji: '💻' },
  ] as const;

  return (
    <div className="flex-1 flex flex-col">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2">
          Choose Your Theme
        </h2>
        <p className="text-surface-600 dark:text-surface-400">
          You can always change this later.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-4">
          {themes.map((t, idx) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setTheme(t.id)}
              className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 ${
                theme === t.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 hover:border-surface-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{t.emoji}</span>
                <div className="text-left">
                  <p className="font-semibold text-lg text-surface-900 dark:text-surface-50">
                    {t.label}
                  </p>
                  <p className="text-surface-500">{t.description}</p>
                </div>
                {theme === t.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                  >
                    <Check className="w-6 h-6 text-primary-500" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GoalStep({ goalName, setGoalName, goalAmount, setGoalAmount, currency }: {
  goalName: string;
  setGoalName: (v: string) => void;
  goalAmount: string;
  setGoalAmount: (v: string) => void;
  currency: string;
}) {
  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || '$';

  const suggestions = [
    { name: 'Emergency Fund', amount: 5000 },
    { name: 'Vacation', amount: 2000 },
    { name: 'New Laptop', amount: 1500 },
    { name: 'Home Deposit', amount: 10000 },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2">
          Create Your First Goal
        </h2>
        <p className="text-surface-600 dark:text-surface-400">
          What are you saving for? (Optional)
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="label">Goal Name</label>
          <input
            type="text"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            placeholder="e.g., Emergency Fund"
            className="input"
          />
        </div>

        <div>
          <label className="label">Target Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-lg">
              {currencySymbol}
            </span>
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              placeholder="0.00"
              className="input pl-8"
            />
          </div>
        </div>

        <div>
          <p className="label">Quick Suggestions</p>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((s) => (
              <button
                key={s.name}
                onClick={() => {
                  setGoalName(s.name);
                  setGoalAmount(s.amount.toString());
                }}
                className="p-3 rounded-xl bg-surface-100 dark:bg-surface-800 text-left hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                <p className="font-medium text-surface-900 dark:text-surface-50">
                  {s.name}
                </p>
                <p className="text-sm text-surface-500">
                  {currencySymbol}{s.amount.toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BudgetStep({ budgetCategory, setBudgetCategory, budgetAmount, setBudgetAmount, currency }: {
  budgetCategory: string;
  setBudgetCategory: (v: string) => void;
  budgetAmount: string;
  setBudgetAmount: (v: string) => void;
  currency: string;
}) {
  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || '$';

  const budgetCategories = CATEGORIES.filter((c) => c.type === 'expense');

  return (
    <div className="flex-1 flex flex-col">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2">
          Set Your First Budget
        </h2>
        <p className="text-surface-600 dark:text-surface-400">
          Create a weekly spending limit. (Optional)
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="label">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {budgetCategories.slice(0, 9).map((cat) => (
              <button
                key={cat.name}
                onClick={() => setBudgetCategory(cat.name)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  budgetCategory === cat.name
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900'
                }`}
              >
                <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
                  {cat.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Weekly Limit</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-lg">
              {currencySymbol}
            </span>
            <input
              type="number"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              placeholder="0.00"
              className="input pl-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CompleteStep({ icon: Icon, title }: { icon: typeof Sparkles; title: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-glow-lg mb-8"
      >
        <Icon className="w-16 h-16 text-white" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-4"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-surface-600 dark:text-surface-400 text-lg max-w-sm"
      >
        Your financial journey begins now. Let's start tracking your progress!
      </motion.p>
    </div>
  );
}
