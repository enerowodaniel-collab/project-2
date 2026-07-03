import { motion, useSpring } from 'framer-motion';
import { useStore } from '../lib/store';
import { useMemo } from 'react';

interface HealthScore {
  score: number;
  label: string;
  color: string;
  emoji: 'great' | 'good' | 'okay' | 'warning' | 'bad';
}

export function FinancialHealthScore() {
  const { transactions, savingsGoals, budgets, totalIncome, totalExpenses, currentBalance } = useStore();

  const healthScore = useMemo((): HealthScore => {
    if (transactions.length === 0) {
      return { score: 50, label: 'Getting Started', color: '#94a3b8', emoji: 'okay' };
    }

    let score = 50;

    // Spending ratio (0-30 points)
    const spendingRatio = totalIncome > 0 ? totalExpenses / totalIncome : 1;
    if (spendingRatio < 0.5) score += 30;
    else if (spendingRatio < 0.7) score += 20;
    else if (spendingRatio < 0.9) score += 10;
    else if (spendingRatio > 1) score -= 10;

    // Savings progress (0-20 points)
    if (savingsGoals.length > 0) {
      const avgProgress = savingsGoals.reduce((sum, g) => sum + (g.current_amount / g.target_amount), 0) / savingsGoals.length;
      score += Math.min(avgProgress * 20, 20);
    }

    // Budget adherence (0-15 points)
    if (budgets.length > 0) {
      score += 10; // Just having budgets is good
    }

    // Balance health (0-15 points)
    if (currentBalance > 0) score += 15;
    else if (currentBalance < -1000) score -= 5;

    // Recent activity (-5 to +5 points)
    const recentTransactions = transactions.filter((t) => {
      const txDate = new Date(t.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return txDate > weekAgo;
    });
    if (recentTransactions.length > 0 && recentTransactions.length < 50) score += 5;

    score = Math.max(0, Math.min(100, score));

    if (score >= 80) return { score, label: 'Excellent', color: '#10b981', emoji: 'great' };
    if (score >= 60) return { score, label: 'Good', color: '#3b82f6', emoji: 'good' };
    if (score >= 40) return { score, label: 'Fair', color: '#f59e0b', emoji: 'okay' };
    if (score >= 20) return { score, label: 'Needs Work', color: '#f97316', emoji: 'warning' };
    return { score, label: 'At Risk', color: '#ef4444', emoji: 'bad' };
  }, [transactions, savingsGoals, budgets, totalIncome, totalExpenses, currentBalance]);

  const springScore = useSpring(0, { stiffness: 50, damping: 20 });

  return (
    <div className="card p-6 mb-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <motion.div
            className="relative"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <SmileyFace emoji={healthScore.emoji} score={healthScore.score} />
          </motion.div>
        </div>
        <div className="flex-1">
          <p className="text-surface-500 text-sm mb-1">Financial Health</p>
          <div className="flex items-baseline gap-2">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold"
              style={{ color: healthScore.color }}
            >
              {Math.round(healthScore.score)}
            </motion.span>
            <span className="text-lg text-surface-500">/100</span>
          </div>
          <p className="font-medium mt-1" style={{ color: healthScore.color }}>
            {healthScore.label}
          </p>
        </div>
      </div>
    </div>
  );
}

function SmileyFace({ emoji, score }: { emoji: HealthScore['emoji']; score: number }) {
  const colors = {
    great: { bg: '#10b981', face: '#fff' },
    good: { bg: '#3b82f6', face: '#fff' },
    okay: { bg: '#f59e0b', face: '#fff' },
    warning: { bg: '#f97316', face: '#fff' },
    bad: { bg: '#ef4444', face: '#fff' },
  };

  const color = colors[emoji];

  return (
    <svg className="w-20 h-20" viewBox="0 0 100 100">
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        fill={color.bg}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      />
      {/* Eyes */}
      {emoji === 'great' && (
        <>
          <motion.path
            d="M30 35 Q35 30 40 35"
            fill="none"
            stroke={color.face}
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          />
          <motion.path
            d="M60 35 Q65 30 70 35"
            fill="none"
            stroke={color.face}
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          />
        </>
      )}
      {(emoji === 'good' || emoji === 'okay') && (
        <>
          <motion.circle cx="35" cy="35" r="4" fill={color.face} />
          <motion.circle cx="65" cy="35" r="4" fill={color.face} />
        </>
      )}
      {(emoji === 'warning' || emoji === 'bad') && (
        <>
          <motion.circle cx="35" cy="35" r="4" fill={color.face} />
          <motion.circle cx="65" cy="35" r="4" fill={color.face} />
        </>
      )}
      {/* Mouth */}
      {emoji === 'great' && (
        <motion.path
          d="M30 55 Q50 75 70 55"
          fill="none"
          stroke={color.face}
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.2 }}
        />
      )}
      {emoji === 'good' && (
        <motion.path
          d="M32 58 Q50 68 68 58"
          fill="none"
          stroke={color.face}
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
        />
      )}
      {emoji === 'okay' && (
        <motion.line
          x1="30"
          y1="60"
          x2="70"
          y2="60"
          stroke={color.face}
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
        />
      )}
      {emoji === 'warning' && (
        <motion.path
          d="M30 65 Q50 55 70 65"
          fill="none"
          stroke={color.face}
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
        />
      )}
      {emoji === 'bad' && (
        <motion.path
          d="M30 70 Q50 55 70 70"
          fill="none"
          stroke={color.face}
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
        />
      )}
    </svg>
  );
}
