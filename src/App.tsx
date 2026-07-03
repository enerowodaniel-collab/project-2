import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './lib/store';
import { ThemeProvider } from './lib/theme';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { SavingsGoals } from './pages/SavingsGoals';
import { Budgets } from './pages/Budgets';
import { Challenges } from './pages/Challenges';
import { Calendar } from './pages/Calendar';
import { Profile } from './pages/Profile';
import { BottomNav } from './components/BottomNav';
import { LoadingScreen } from './components/LoadingScreen';
import { ConfettiProvider } from './components/Confetti';

type Page = 'dashboard' | 'transactions' | 'goals' | 'budgets' | 'challenges' | 'calendar' | 'profile';

function AppContent() {
  const { isLoading, isInitialized, preferences, initialize } = useStore();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading || !isInitialized) {
    return <LoadingScreen />;
  }

  if (!preferences?.onboarding_completed) {
    return <Onboarding />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'goals':
        return <SavingsGoals />;
      case 'budgets':
        return <Budgets />;
      case 'challenges':
        return <Challenges />;
      case 'calendar':
        return <Calendar />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ConfettiProvider>
      <div className="min-h-screen pb-20 bg-gradient-mesh">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
        <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>
    </ConfettiProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
