/*
# Personal Finance Tracker - Core Schema

1. New Tables
- `user_preferences` - Stores user settings like currency, theme, onboarding completion
- `transactions` - All income and expense transactions with categories
- `savings_goals` - Savings goals with target amounts, deadlines, progress
- `budgets` - Weekly and monthly budget limits per category
- `food_challenges` - Weekly food budget dice challenge tracking
- `subscriptions` - Recurring subscription tracking
- `achievements` - User achievements and badges earned
- `gamification` - XP, streaks, and gamification progress

2. Security
- Enable RLS on all tables
- Single-tenant app: allow anon + authenticated full access
- All tables use `TO anon, authenticated` policies

3. Notes
- Uses gen_random_uuid() for primary keys
- Timestamps with timestamptz for proper timezone handling
- Categories stored as text enums for flexibility
- Onboarding state tracked in user_preferences
*/

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency text NOT NULL DEFAULT 'USD',
  currency_symbol text NOT NULL DEFAULT '$',
  theme text NOT NULL DEFAULT 'system',
  onboarding_completed boolean NOT NULL DEFAULT false,
  onboarding_step integer NOT NULL DEFAULT 0,
  first_savings_goal_created boolean NOT NULL DEFAULT false,
  first_budget_created boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount decimal(12,2) NOT NULL,
  category text NOT NULL,
  description text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  is_recurring boolean NOT NULL DEFAULT false,
  recurring_frequency text CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Savings Goals Table
CREATE TABLE IF NOT EXISTS savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  target_amount decimal(12,2) NOT NULL,
  current_amount decimal(12,2) NOT NULL DEFAULT 0,
  deadline date,
  color text NOT NULL DEFAULT '#10B981',
  icon text NOT NULL DEFAULT 'target',
  milestone_percentage integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  amount decimal(12,2) NOT NULL,
  period text NOT NULL CHECK (period IN ('weekly', 'monthly')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Food Budget Challenges Table
CREATE TABLE IF NOT EXISTS food_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  budget_amount decimal(12,2) NOT NULL,
  spent_amount decimal(12,2) NOT NULL DEFAULT 0,
  dice_value integer NOT NULL CHECK (dice_value BETWEEN 1 AND 6),
  is_completed boolean NOT NULL DEFAULT false,
  is_successful boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount decimal(12,2) NOT NULL,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('weekly', 'monthly', 'yearly')),
  next_billing_date date NOT NULL,
  category text NOT NULL DEFAULT 'subscription',
  is_active boolean NOT NULL DEFAULT true,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  xp_reward integer NOT NULL DEFAULT 0
);

-- Gamification Stats Table
CREATE TABLE IF NOT EXISTS gamification_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_xp integer NOT NULL DEFAULT 0,
  current_level integer NOT NULL DEFAULT 1,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  total_achievements integer NOT NULL DEFAULT 0,
  food_challenge_streak integer NOT NULL DEFAULT 0,
  savings_streak integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_stats ENABLE ROW LEVEL SECURITY;

-- User Preferences Policies
DROP POLICY IF EXISTS "anon_preferences_crud" ON user_preferences;
CREATE POLICY "anon_preferences_crud" ON user_preferences FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Transactions Policies
DROP POLICY IF EXISTS "anon_transactions_select" ON transactions;
CREATE POLICY "anon_transactions_select" ON transactions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_transactions_insert" ON transactions;
CREATE POLICY "anon_transactions_insert" ON transactions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_transactions_update" ON transactions;
CREATE POLICY "anon_transactions_update" ON transactions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_transactions_delete" ON transactions;
CREATE POLICY "anon_transactions_delete" ON transactions FOR DELETE
  TO anon, authenticated USING (true);

-- Savings Goals Policies
DROP POLICY IF EXISTS "anon_goals_select" ON savings_goals;
CREATE POLICY "anon_goals_select" ON savings_goals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_goals_insert" ON savings_goals;
CREATE POLICY "anon_goals_insert" ON savings_goals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_goals_update" ON savings_goals;
CREATE POLICY "anon_goals_update" ON savings_goals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_goals_delete" ON savings_goals;
CREATE POLICY "anon_goals_delete" ON savings_goals FOR DELETE
  TO anon, authenticated USING (true);

-- Budgets Policies
DROP POLICY IF EXISTS "anon_budgets_select" ON budgets;
CREATE POLICY "anon_budgets_select" ON budgets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_budgets_insert" ON budgets;
CREATE POLICY "anon_budgets_insert" ON budgets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_budgets_update" ON budgets;
CREATE POLICY "anon_budgets_update" ON budgets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_budgets_delete" ON budgets;
CREATE POLICY "anon_budgets_delete" ON budgets FOR DELETE
  TO anon, authenticated USING (true);

-- Food Challenges Policies
DROP POLICY IF EXISTS "anon_challenges_select" ON food_challenges;
CREATE POLICY "anon_challenges_select" ON food_challenges FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_challenges_insert" ON food_challenges;
CREATE POLICY "anon_challenges_insert" ON food_challenges FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_challenges_update" ON food_challenges;
CREATE POLICY "anon_challenges_update" ON food_challenges FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_challenges_delete" ON food_challenges;
CREATE POLICY "anon_challenges_delete" ON food_challenges FOR DELETE
  TO anon, authenticated USING (true);

-- Subscriptions Policies
DROP POLICY IF EXISTS "anon_subscriptions_select" ON subscriptions;
CREATE POLICY "anon_subscriptions_select" ON subscriptions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_subscriptions_insert" ON subscriptions;
CREATE POLICY "anon_subscriptions_insert" ON subscriptions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_subscriptions_update" ON subscriptions;
CREATE POLICY "anon_subscriptions_update" ON subscriptions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_subscriptions_delete" ON subscriptions;
CREATE POLICY "anon_subscriptions_delete" ON subscriptions FOR DELETE
  TO anon, authenticated USING (true);

-- Achievements Policies
DROP POLICY IF EXISTS "anon_achievements_select" ON achievements;
CREATE POLICY "anon_achievements_select" ON achievements FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_achievements_insert" ON achievements;
CREATE POLICY "anon_achievements_insert" ON achievements FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_achievements_delete" ON achievements;
CREATE POLICY "anon_achievements_delete" ON achievements FOR DELETE
  TO anon, authenticated USING (true);

-- Gamification Stats Policies
DROP POLICY IF EXISTS "anon_stats_select" ON gamification_stats;
CREATE POLICY "anon_stats_select" ON gamification_stats FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_stats_insert" ON gamification_stats;
CREATE POLICY "anon_stats_insert" ON gamification_stats FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_stats_update" ON gamification_stats;
CREATE POLICY "anon_stats_update" ON gamification_stats FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period);
CREATE INDEX IF NOT EXISTS idx_budgets_dates ON budgets(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_food_challenges_week ON food_challenges(week_start_date);
CREATE INDEX IF NOT EXISTS idx_savings_goals_completed ON savings_goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_achievements_earned ON achievements(earned_at DESC);

-- Insert default gamification stats if not exists
INSERT INTO gamification_stats (id, total_xp, current_level, current_streak, longest_streak)
SELECT gen_random_uuid(), 0, 1, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM gamification_stats);

-- Insert default user preferences if not exists
INSERT INTO user_preferences (id, currency, currency_symbol, theme, onboarding_completed)
SELECT gen_random_uuid(), 'USD', '$', 'system', false
WHERE NOT EXISTS (SELECT 1 FROM user_preferences);