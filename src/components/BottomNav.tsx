import { motion } from 'framer-motion';
import { LayoutDashboard, Receipt, PiggyBank, Calendar, User, Target, UtensilsCrossed } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'challenges', label: 'Challenge', icon: UtensilsCrossed },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-40"
    >
      <div className="mx-2 mb-2 glass rounded-2xl shadow-lg safe-bottom">
        <div className="flex justify-around items-center py-2 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-primary-500'
                    : 'text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300'
                }`}
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="navGlow"
                      className="absolute inset-0 bg-primary-500/20 rounded-lg blur-md"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`w-5 h-5 relative z-10 transition-transform duration-200 ${
                      isActive ? 'scale-110' : ''
                    }`}
                  />
                </div>
                <span className="text-[10px] font-medium mt-1 transition-all duration-200">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary-500"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
