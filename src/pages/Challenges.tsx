import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../lib/store';
import { CURRENCIES, FOOD_BUDGET_VALUES, CATEGORIES, FoodChallenge } from '../types';
import { AnimatedCounter, ProgressRing, SlideInView } from '../components/UI';
import { useConfetti } from '../components/Confetti';
import { Dice3D } from '../components/Dice3D';
import { Dice1, Trophy, Flame, Medal, Calendar, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { format, differenceInDays, startOfWeek, endOfWeek, addDays } from 'date-fns';

export function Challenges() {
  const {
    foodChallenges,
    transactions,
    preferences,
    gamificationStats,
    createFoodChallenge,
    updateFoodChallenge,
    checkAndAwardAchievement,
  } = useStore();
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { showConfetti } = useConfetti();

  const currencySymbol = CURRENCIES.find((c) => c.code === preferences?.currency)?.symbol || '$';

  // Get active challenge
  const today = new Date();
  const activeChallenge = foodChallenges.find((c) => {
    const startDate = new Date(c.week_start_date);
    const endDate = new Date(c.week_end_date);
    return today >= startDate && today <= endDate && !c.is_completed;
  });

  // Get food transactions for this week
  const getFoodSpending = (challenge: FoodChallenge) => {
    const startDate = new Date(challenge.week_start_date);
    const endDate = new Date(challenge.week_end_date);

    return transactions
      .filter((t) => {
        const txDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          t.category === 'food' &&
          txDate >= startDate &&
          txDate <= endDate
        );
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  // Calculate progress for active challenge
  const challengeProgress = activeChallenge
    ? Math.min((getFoodSpending(activeChallenge) / activeChallenge.budget_amount) * 100, 100)
    : 0;

  const handleDiceRoll = async () => {
    setIsRolling(true);
    setShowResult(false);

    // Random dice value
    const value = Math.floor(Math.random() * 6) + 1;
    setDiceValue(value);

    // Wait for animation
    setTimeout(async () => {
      setIsRolling(false);
      setShowResult(true);

      // Create challenge
      await createFoodChallenge(value);

      // Award XP
      if (gamificationStats) {
        const newStreak = gamificationStats.food_challenge_streak + 1;
        if (newStreak === 3) {
          checkAndAwardAchievement('food_challenge_win');
        }
      }
    }, 2000);
  };

  // Check if challenge was successful
  useEffect(() => {
    if (!activeChallenge) return;

    const spent = getFoodSpending(activeChallenge);
    const wasSuccessful = spent <= activeChallenge.budget_amount;
    const isLastDay = differenceInDays(new Date(activeChallenge.week_end_date), today) === 0;

    if (isLastDay && !activeChallenge.is_completed) {
      updateFoodChallenge(activeChallenge.id, {
        is_completed: true,
        is_successful: wasSuccessful,
        spent_amount: spent,
      });

      if (wasSuccessful) {
        showConfetti({ count: 80 });
        checkAndAwardAchievement('food_challenge_win');
      }
    }
  }, [activeChallenge]);

  // Past challenges
  const completedChallenges = foodChallenges
    .filter((c) => c.is_completed)
    .sort((a, b) => new Date(b.week_start_date).getTime() - new Date(a.week_start_date).getTime())
    .slice(0, 5);

  const successRate = completedChallenges.length > 0
    ? (completedChallenges.filter((c) => c.is_successful).length / completedChallenges.length) * 100
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                Food Challenge
              </h1>
              <p className="text-surface-500 text-sm mt-1">
                Roll the dice for your weekly food budget
              </p>
            </div>
            {gamificationStats && gamificationStats.food_challenge_streak > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-warning-100 dark:bg-warning-900/30">
                <Flame className="w-5 h-5 text-warning-500" />
                <span className="font-bold text-warning-600 dark:text-warning-400">
                  {gamificationStats.food_challenge_streak} streak
                </span>
              </div>
            )}
          </div>
        </motion.header>

        {/* Active Challenge or Dice Roll */}
        {activeChallenge ? (
          <ActiveChallengeCard
            challenge={activeChallenge}
            spent={getFoodSpending(activeChallenge)}
            progress={challengeProgress}
            currencySymbol={currencySymbol}
          />
        ) : (
          <SlideInView>
            <div className="card p-6 mb-6 text-center">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-2">
                Ready for a New Challenge?
              </h2>
              <p className="text-surface-500 text-sm mb-6">
                Roll the dice to set your weekly food budget
              </p>

              {/* Dice Area */}
              <div className="flex flex-col items-center">
                <Dice3D
                  isRolling={isRolling}
                  value={diceValue}
                />

                {/* Budget Options Preview */}
                <div className="grid grid-cols-3 gap-2 mb-6 w-full">
                  {Object.entries(FOOD_BUDGET_VALUES).map(([key, val]) => (
                    <motion.div
                      key={key}
                      className={`p-3 rounded-xl text-center transition-all ${
                        diceValue === parseInt(key) && showResult
                          ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                          : 'bg-surface-100 dark:bg-surface-800'
                      }`}
                      animate={
                        diceValue === parseInt(key) && showResult
                          ? { scale: [1, 1.1, 1] }
                          : {}
                      }
                    >
                      <Dice1 className="w-5 h-5 mx-auto mb-1 text-surface-400" />
                      <p className="text-xs font-medium" style={{ color: val.color }}>
                        {currencySymbol}{val.amount}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Roll Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDiceRoll}
                  disabled={isRolling}
                  className={`btn-primary py-4 px-12 ${isRolling ? 'opacity-70' : ''}`}
                >
                  {isRolling ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Dice1 className="w-5 h-5" />
                    </motion.span>
                  ) : (
                    <>
                      <Dice1 className="w-5 h-5" />
                      Roll the Dice!
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </SlideInView>
        )}

        {/* Stats */}
        {completedChallenges.length > 0 && (
          <SlideInView delay={0.2}>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="card p-4 text-center">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-warning-500" />
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                  {completedChallenges.filter((c) => c.is_successful).length}
                </p>
                <p className="text-xs text-surface-500">Wins</p>
              </div>
              <div className="card p-4 text-center">
                <Medal className="w-6 h-6 mx-auto mb-2 text-primary-500" />
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                  {successRate.toFixed(0)}%
                </p>
                <p className="text-xs text-surface-500">Success Rate</p>
              </div>
              <div className="card p-4 text-center">
                <Flame className="w-6 h-6 mx-auto mb-2 text-error-500" />
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                  {gamificationStats?.food_challenge_streak || 0}
                </p>
                <p className="text-xs text-surface-500">Streak</p>
              </div>
            </div>
          </SlideInView>
        )}

        {/* Past Challenges */}
        {completedChallenges.length > 0 && (
          <SlideInView delay={0.3}>
            <div className="card p-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">
                Past Challenges
              </h2>
              <div className="space-y-3">
                {completedChallenges.map((challenge, index) => {
                  const budgetInfo = FOOD_BUDGET_VALUES[challenge.dice_value as keyof typeof FOOD_BUDGET_VALUES];

                  return (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: budgetInfo.color }}
                      >
                        {challenge.dice_value}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-surface-900 dark:text-surface-50">
                          {format(new Date(challenge.week_start_date), 'MMM d')} -{' '}
                          {format(new Date(challenge.week_end_date), 'MMM d')}
                        </p>
                        <p className="text-sm text-surface-500">
                          Budget: {currencySymbol}{challenge.budget_amount}
                        </p>
                      </div>
                      <div className="text-right">
                        {challenge.is_successful ? (
                          <span className="badge-success">
                            <Trophy className="w-3 h-3" />
                            Win
                          </span>
                        ) : (
                          <span className="badge-error">
                            Missed
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </SlideInView>
        )}

        {/* How It Works */}
        <SlideInView delay={0.4}>
          <div className="card p-4 mt-4">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">
              How It Works
            </h2>
            <div className="space-y-4">
              {[
                { step: 'Roll', desc: 'Roll the dice to get your weekly food budget', icon: Dice1 },
                { step: 'Track', desc: 'Record all your food expenses throughout the week', icon: Calendar },
                { step: 'Win', desc: 'Stay under budget to win XP and achievements', icon: Trophy },
              ].map((item, idx) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                      {idx + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-surface-900 dark:text-surface-50">
                      {item.step}
                    </p>
                    <p className="text-sm text-surface-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SlideInView>
      </div>
    </div>
  );
}

function ActiveChallengeCard({
  challenge,
  spent,
  progress,
  currencySymbol,
}: {
  challenge: FoodChallenge;
  spent: number;
  progress: number;
  currencySymbol: string;
}) {
  const budgetInfo = FOOD_BUDGET_VALUES[challenge.dice_value as keyof typeof FOOD_BUDGET_VALUES];
  const remaining = challenge.budget_amount - spent;
  const daysLeft = differenceInDays(new Date(challenge.week_end_date), new Date());
  const isOverBudget = remaining < 0;

  return (
    <SlideInView>
      <div className={`card p-6 mb-6 ${isOverBudget ? 'border-error-500' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-surface-500 text-sm">Current Challenge</p>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">
              Weekly Food Budget
            </h2>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
            style={{ backgroundColor: budgetInfo.color }}
          >
            {challenge.dice_value}
          </div>
        </div>

        {/* Progress Circle */}
        <div className="flex items-center gap-6 mb-6">
          <ProgressRing
            progress={Math.min(progress, 100)}
            size={100}
            strokeWidth={10}
            color={isOverBudget ? '#ef4444' : budgetInfo.color}
          >
            <div className="text-center">
              <AnimatedCounter
                value={Math.min(progress, 100)}
                decimals={0}
                suffix="%"
                className="text-xl font-bold text-surface-900 dark:text-surface-50"
              />
              <p className="text-xs text-surface-500">spent</p>
            </div>
          </ProgressRing>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-surface-500 text-sm">Spent</span>
              <span className="font-semibold text-surface-900 dark:text-surface-50">
                {currencySymbol}{spent.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-surface-500 text-sm">Budget</span>
              <span className="font-semibold text-surface-900 dark:text-surface-50">
                {currencySymbol}{challenge.budget_amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500 text-sm">Remaining</span>
              <span className={`font-semibold ${isOverBudget ? 'text-error-500' : 'text-success-500'}`}>
                {isOverBudget ? '-' : ''}{currencySymbol}{Math.abs(remaining).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Days Left */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-surface-400" />
            <span className="text-surface-500">
              {format(new Date(challenge.week_start_date), 'MMM d')} - {format(new Date(challenge.week_end_date), 'MMM d')}
            </span>
          </div>
          <span className={`font-bold ${daysLeft <= 1 ? 'text-warning-500' : 'text-primary-500'}`}>
            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
          </span>
        </div>

        {/* Tips */}
        {isOverBudget && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 rounded-xl bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800"
          >
            <p className="text-error-700 dark:text-error-300 text-sm font-medium">
              You've exceeded your food budget! Try cooking at home to catch up.
            </p>
          </motion.div>
        )}
      </div>
    </SlideInView>
  );
}
