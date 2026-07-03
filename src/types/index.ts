export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string | null;
  date: string;
  is_recurring: boolean;
  recurring_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  color: string;
  icon: string;
  milestone_percentage: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly';
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FoodChallenge {
  id: string;
  week_start_date: string;
  week_end_date: string;
  budget_amount: number;
  spent_amount: number;
  dice_value: number;
  is_completed: boolean;
  is_successful: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billing_cycle: 'weekly' | 'monthly' | 'yearly';
  next_billing_date: string;
  category: string;
  is_active: boolean;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  achievement_id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  xp_reward: number;
}

export interface GamificationStats {
  id: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_achievements: number;
  food_challenge_streak: number;
  savings_streak: number;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  currency: string;
  currency_symbol: string;
  theme: 'light' | 'dark' | 'system';
  onboarding_completed: boolean;
  onboarding_step: number;
  first_savings_goal_created: boolean;
  first_budget_created: boolean;
  created_at: string;
  updated_at: string;
}

export type TransactionCategory =
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'gift'
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'bills'
  | 'healthcare'
  | 'education'
  | 'travel'
  | 'subscription'
  | 'other';

export interface CategoryInfo {
  name: TransactionCategory;
  label: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export const CATEGORIES: CategoryInfo[] = [
  { name: 'salary', label: 'Salary', icon: 'briefcase', color: '#10B981', type: 'income' },
  { name: 'freelance', label: 'Freelance', icon: 'laptop', color: '#3B82F6', type: 'income' },
  { name: 'investment', label: 'Investment', icon: 'trending-up', color: '#8B5CF6', type: 'income' },
  { name: 'gift', label: 'Gift', icon: 'gift', color: '#EC4899', type: 'income' },
  { name: 'food', label: 'Food & Dining', icon: 'utensils', color: '#F59E0B', type: 'expense' },
  { name: 'transport', label: 'Transport', icon: 'car', color: '#6366F1', type: 'expense' },
  { name: 'entertainment', label: 'Entertainment', icon: 'tv', color: '#EF4444', type: 'expense' },
  { name: 'shopping', label: 'Shopping', icon: 'shopping-bag', color: '#F97316', type: 'expense' },
  { name: 'bills', label: 'Bills', icon: 'file-text', color: '#64748B', type: 'expense' },
  { name: 'healthcare', label: 'Healthcare', icon: 'heart', color: '#14B8A6', type: 'expense' },
  { name: 'education', label: 'Education', icon: 'book', color: '#A855F7', type: 'expense' },
  { name: 'travel', label: 'Travel', icon: 'plane', color: '#0EA5E9', type: 'expense' },
  { name: 'subscription', label: 'Subscription', icon: 'repeat', color: '#7C3AED', type: 'expense' },
  { name: 'other', label: 'Other', icon: 'more-horizontal', color: '#94A3B8', type: 'both' },
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: '$', name: 'Hong Kong Dollar' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'NZD', symbol: '$', name: 'New Zealand Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
];

export const ACHIEVEMENT_DEFINITIONS = [
  { id: 'first_transaction', name: 'First Step', description: 'Add your first transaction', icon: 'star', xp: 50 },
  { id: 'first_goal', name: 'Dreamer', description: 'Create your first savings goal', icon: 'target', xp: 100 },
  { id: 'first_budget', name: 'Planner', description: 'Set up your first budget', icon: 'pie-chart', xp: 100 },
  { id: 'goal_reached', name: 'Goal Crusher', description: 'Reach a savings goal', icon: 'trophy', xp: 200 },
  { id: 'week_streak_3', name: 'Consistent', description: 'Maintain a 3-day streak', icon: 'flame', xp: 75 },
  { id: 'week_streak_7', name: 'Weekly Warrior', description: 'Maintain a 7-day streak', icon: 'zap', xp: 150 },
  { id: 'month_streak', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: 'award', xp: 500 },
  { id: 'food_challenge_win', name: 'Food Champion', description: 'Win a weekly food challenge', icon: 'utensils', xp: 100 },
  { id: 'food_streak_3', name: 'Diet Master', description: 'Win 3 food challenges in a row', icon: 'medal', xp: 300 },
  { id: 'under_budget', name: 'Under Budget', description: 'Stay under budget for a week', icon: 'check-circle', xp: 100 },
  { id: 'savings_100', name: 'Century Saver', description: 'Save $100 total', icon: 'piggy-bank', xp: 100 },
  { id: 'savings_500', name: 'Super Saver', description: 'Save $500 total', icon: 'gem', xp: 250 },
  { id: 'savings_1000', name: 'Savings Master', description: 'Save $1000 total', icon: 'crown', xp: 500 },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: 'star', xp: 0 },
  { id: 'level_10', name: 'Finance Expert', description: 'Reach level 10', icon: 'star', xp: 0 },
];

export const FOOD_BUDGET_VALUES = {
  1: { amount: 40, label: '$40 - Extreme Budget', color: '#EF4444', difficulty: 'extreme' },
  2: { amount: 60, label: '$60 - Strict Budget', color: '#F97316', difficulty: 'hard' },
  3: { amount: 80, label: '$80 - Moderate Budget', color: '#F59E0B', difficulty: 'medium' },
  4: { amount: 100, label: '$100 - Balanced Budget', color: '#10B981', difficulty: 'medium' },
  5: { amount: 120, label: '$120 - Comfortable Budget', color: '#3B82F6', difficulty: 'easy' },
  6: { amount: 150, label: '$150 - Generous Budget', color: '#8B5CF6', difficulty: 'easy' },
};
