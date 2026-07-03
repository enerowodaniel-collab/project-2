import { motion } from 'framer-motion';
import { Crown, Star } from 'lucide-react';

interface LevelBadgeProps {
  level: number;
  xp: number;
  size?: 'sm' | 'md' | 'lg';
}

export function LevelBadge({ level, xp, size = 'md' }: LevelBadgeProps) {
  const nextLevel = level + 1;
  const currentLevelXP = (level - 1) * 100;
  const nextLevelXP = nextLevel * 100;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const sizes = {
    sm: { badge: 'px-2 py-1', text: 'text-xs', icon: 'w-3 h-3' },
    md: { badge: 'px-3 py-1.5', text: 'text-sm', icon: 'w-4 h-4' },
    lg: { badge: 'px-4 py-2', text: 'text-base', icon: 'w-5 h-5' },
  };

  const { badge, text, icon } = sizes[size];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white ${badge}`}
    >
      <Crown className={icon} />
      <span className={`font-bold ${text}`}>Lv.{level}</span>
    </motion.div>
  );
}

export function XPProgress({ currentXP, level }: { currentXP: number; level: number }) {
  const nextLevel = level + 1;
  const currentLevelXP = (level - 1) * 100;
  const nextLevelXP = nextLevel * 100;
  const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  const xpNeeded = nextLevelXP - currentXP;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-surface-500 mb-1">
        <span>Level {level}</span>
        <span>{xpNeeded} XP to Level {nextLevel}</span>
      </div>
      <div className="progress">
        <motion.div
          className="progress-bar bg-gradient-to-r from-primary-500 to-accent-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
