import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';
import type {
  Transaction,
  SavingsGoal,
  Budget,
  FoodChallenge,
  Subscription,
  Achievement,
  GamificationStats,
  UserPreferences,
} from '../types';

interface AppState {
  // UI State
  isLoading: boolean;
  isInitialized: boolean;

  // Data
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  budgets: Budget[];
  foodChallenges: FoodChallenge[];
  subscriptions: Subscription[];
  achievements: Achievement[];
  gamificationStats: GamificationStats | null;
  preferences: UserPreferences | null;

  // Computed values
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;

  // Actions
  initialize: () => Promise<void>;
  setLoading: (loading: boolean) => void;

  // Preferences
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;

  // Transactions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Savings Goals
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at'>) => Promise<SavingsGoal>;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  addToSavingsGoal: (id: string, amount: number) => Promise<void>;

  // Budgets
  addBudget: (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) => Promise<Budget>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Food Challenges
  createFoodChallenge: (diceValue: number) => Promise<FoodChallenge>;
  updateFoodChallenge: (id: string, updates: Partial<FoodChallenge>) => Promise<void>;
  getActiveFoodChallenge: () => FoodChallenge | null;

  // Subscriptions
  addSubscription: (sub: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) => Promise<Subscription>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;

  // Achievements
  checkAndAwardAchievement: (achievementId: string) => Promise<Achievement | null>;
  addXP: (amount: number) => Promise<void>;

  // Recalculate totals
  recalculateTotals: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial UI State
      isLoading: true,
      isInitialized: false,

      // Initial Data
      transactions: [],
      savingsGoals: [],
      budgets: [],
      foodChallenges: [],
      subscriptions: [],
      achievements: [],
      gamificationStats: null,
      preferences: null,

      // Computed
      currentBalance: 0,
      totalIncome: 0,
      totalExpenses: 0,
      totalSavings: 0,

      // Initialize
      initialize: async () => {
        try {
          set({ isLoading: true });

          const [
            { data: preferences },
            { data: transactions },
            { data: savingsGoals },
            { data: budgets },
            { data: foodChallenges },
            { data: subscriptions },
            { data: achievements },
            { data: gamificationStats },
          ] = await Promise.all([
            supabase.from('user_preferences').select('*').maybeSingle(),
            supabase.from('transactions').select('*').order('date', { ascending: false }),
            supabase.from('savings_goals').select('*').order('created_at', { ascending: false }),
            supabase.from('budgets').select('*').eq('is_active', true).order('created_at', { ascending: false }),
            supabase.from('food_challenges').select('*').order('week_start_date', { ascending: false }),
            supabase.from('subscriptions').select('*').eq('is_active', true).order('next_billing_date'),
            supabase.from('achievements').select('*').order('earned_at', { ascending: false }),
            supabase.from('gamification_stats').select('*').maybeSingle(),
          ]);

          set({
            preferences: preferences || null,
            transactions: transactions || [],
            savingsGoals: savingsGoals || [],
            budgets: budgets || [],
            foodChallenges: foodChallenges || [],
            subscriptions: subscriptions || [],
            achievements: achievements || [],
            gamificationStats: gamificationStats || null,
            isInitialized: true,
            isLoading: false,
          });

          get().recalculateTotals();
        } catch (error) {
          console.error('Failed to initialize:', error);
          set({ isLoading: false, isInitialized: true });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),

      // Preferences
      updatePreferences: async (updates) => {
        const { preferences } = get();
        if (!preferences) return;

        const { data, error } = await supabase
          .from('user_preferences')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', preferences.id)
          .select()
          .single();

        if (!error && data) {
          set({ preferences: data });
        }
      },

      // Transactions
      addTransaction: async (transactionData) => {
        const { data, error } = await supabase
          .from('transactions')
          .insert(transactionData)
          .select()
          .single();

        if (!error && data) {
          set((state) => ({
            transactions: [data, ...state.transactions],
          }));
          get().recalculateTotals();
          get().addXP(10);

          if (get().transactions.length === 1) {
            get().checkAndAwardAchievement('first_transaction');
          }
          return data;
        }
        throw new Error('Failed to add transaction');
      },

      updateTransaction: async (id, updates) => {
        const { error } = await supabase
          .from('transactions')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (!error) {
          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.id === id ? { ...t, ...updates } : t
            ),
          }));
          get().recalculateTotals();
        }
      },

      deleteTransaction: async (id) => {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (!error) {
          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
          }));
          get().recalculateTotals();
        }
      },

      // Savings Goals
      addSavingsGoal: async (goalData) => {
        const { data, error } = await supabase
          .from('savings_goals')
          .insert(goalData)
          .select()
          .single();

        if (!error && data) {
          set((state) => ({
            savingsGoals: [data, ...state.savingsGoals],
          }));
          get().addXP(25);

          if (get().savingsGoals.length === 1) {
            get().checkAndAwardAchievement('first_goal');
          }
          return data;
        }
        throw new Error('Failed to add savings goal');
      },

      updateSavingsGoal: async (id, updates) => {
        const { error } = await supabase
          .from('savings_goals')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (!error) {
          set((state) => ({
            savingsGoals: state.savingsGoals.map((g) =>
              g.id === id ? { ...g, ...updates } : g
            ),
          }));
          get().recalculateTotals();
        }
      },

      deleteSavingsGoal: async (id) => {
        const { error } = await supabase.from('savings_goals').delete().eq('id', id);
        if (!error) {
          set((state) => ({
            savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
          }));
          get().recalculateTotals();
        }
      },

      addToSavingsGoal: async (id, amount) => {
        const goal = get().savingsGoals.find((g) => g.id === id);
        if (!goal) return;

        const newAmount = Math.min(goal.current_amount + amount, goal.target_amount);
        const isCompleted = newAmount >= goal.target_amount;

        await get().updateSavingsGoal(id, {
          current_amount: newAmount,
          is_completed: isCompleted,
          milestone_percentage: Math.floor((newAmount / goal.target_amount) * 100),
        });

        get().addXP(Math.floor(amount / 10));

        if (isCompleted) {
          get().checkAndAwardAchievement('goal_reached');
        }
      },

      // Budgets
      addBudget: async (budgetData) => {
        const { data, error } = await supabase
          .from('budgets')
          .insert(budgetData)
          .select()
          .single();

        if (!error && data) {
          set((state) => ({
            budgets: [data, ...state.budgets],
          }));
          get().addXP(25);

          if (get().budgets.length === 1) {
            get().checkAndAwardAchievement('first_budget');
          }
          return data;
        }
        throw new Error('Failed to add budget');
      },

      updateBudget: async (id, updates) => {
        const { error } = await supabase
          .from('budgets')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (!error) {
          set((state) => ({
            budgets: state.budgets.map((b) =>
              b.id === id ? { ...b, ...updates } : b
            ),
          }));
        }
      },

      deleteBudget: async (id) => {
        const { error } = await supabase.from('budgets').delete().eq('id', id);
        if (!error) {
          set((state) => ({
            budgets: state.budgets.filter((b) => b.id !== id),
          }));
        }
      },

      // Food Challenges
      createFoodChallenge: async (diceValue) => {
        const { FOOD_BUDGET_VALUES } = await import('../types');
        const budgetAmount = FOOD_BUDGET_VALUES[diceValue as keyof typeof FOOD_BUDGET_VALUES].amount;

        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const challengeData = {
          week_start_date: weekStart.toISOString().split('T')[0],
          week_end_date: weekEnd.toISOString().split('T')[0],
          budget_amount: budgetAmount,
          spent_amount: 0,
          dice_value: diceValue,
          is_completed: false,
          is_successful: false,
        };

        const { data, error } = await supabase
          .from('food_challenges')
          .insert(challengeData)
          .select()
          .single();

        if (!error && data) {
          set((state) => ({
            foodChallenges: [data, ...state.foodChallenges],
          }));
          return data;
        }
        throw new Error('Failed to create food challenge');
      },

      updateFoodChallenge: async (id, updates) => {
        const { error } = await supabase
          .from('food_challenges')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (!error) {
          set((state) => ({
            foodChallenges: state.foodChallenges.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          }));
        }
      },

      getActiveFoodChallenge: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().foodChallenges.find(
          (c) => c.week_start_date <= today && c.week_end_date >= today && !c.is_completed
        ) || null;
      },

      // Subscriptions
      addSubscription: async (subData) => {
        const { data, error } = await supabase
          .from('subscriptions')
          .insert(subData)
          .select()
          .single();

        if (!error && data) {
          set((state) => ({
            subscriptions: [data, ...state.subscriptions],
          }));
          return data;
        }
        throw new Error('Failed to add subscription');
      },

      updateSubscription: async (id, updates) => {
        const { error } = await supabase
          .from('subscriptions')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (!error) {
          set((state) => ({
            subscriptions: state.subscriptions.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          }));
        }
      },

      deleteSubscription: async (id) => {
        const { error } = await supabase.from('subscriptions').delete().eq('id', id);
        if (!error) {
          set((state) => ({
            subscriptions: state.subscriptions.filter((s) => s.id !== id),
          }));
        }
      },

      // Achievements
      checkAndAwardAchievement: async (achievementId) => {
        const { achievements } = get();
        if (achievements.some((a) => a.achievement_id === achievementId)) {
          return null;
        }

        const { ACHIEVEMENT_DEFINITIONS } = await import('../types');
        const definition = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === achievementId);
        if (!definition) return null;

        const achievementData = {
          achievement_id: definition.id,
          name: definition.name,
          description: definition.description,
          icon: definition.icon,
          xp_reward: definition.xp,
        };

        const { data, error } = await supabase
          .from('achievements')
          .insert(achievementData)
          .select()
          .single();

        if (!error && data) {
          set((state) => ({
            achievements: [data, ...state.achievements],
          }));
          get().addXP(definition.xp);
          return data;
        }
        return null;
      },

      addXP: async (amount) => {
        const { gamificationStats } = get();
        if (!gamificationStats) return;

        const newXP = gamificationStats.total_xp + amount;
        const newLevel = Math.floor(newXP / 100) + 1;

        const { error } = await supabase
          .from('gamification_stats')
          .update({
            total_xp: newXP,
            current_level: newLevel,
            last_activity_date: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
          })
          .eq('id', gamificationStats.id);

        if (!error) {
          set({
            gamificationStats: {
              ...gamificationStats,
              total_xp: newXP,
              current_level: newLevel,
              last_activity_date: new Date().toISOString().split('T')[0],
            },
          });
        }
      },

      recalculateTotals: () => {
        const { transactions, savingsGoals } = get();

        const totalIncome = transactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalExpenses = transactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalSavings = savingsGoals.reduce((sum, g) => sum + Number(g.current_amount), 0);

        const currentBalance = totalIncome - totalExpenses;

        set({ totalIncome, totalExpenses, totalSavings, currentBalance });
      },
    }),
    {
      name: 'financeflow-cache',
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);
