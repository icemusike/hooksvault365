-- Create users table extension if not exists (handling by Supabase Auth)
-- This is automatically handled by Supabase, but we're including it for clarity
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create hooks table
CREATE TABLE IF NOT EXISTS hooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  niche VARCHAR(100) NOT NULL,
  tone VARCHAR(100) NOT NULL,
  length VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_favorites table for favorite hooks
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hook_id UUID NOT NULL REFERENCES hooks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, hook_id)
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for hooks table
CREATE TRIGGER set_hooks_updated_at
BEFORE UPDATE ON hooks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create user profiles table which extends auth.users
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  openai_api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for user_profiles table
CREATE TRIGGER set_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
-- Enable Row Level Security
ALTER TABLE hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for hooks: Users can read all hooks, but only modify their own
CREATE POLICY "Users can read all hooks" 
  ON hooks FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own hooks" 
  ON hooks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hooks" 
  ON hooks FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hooks" 
  ON hooks FOR DELETE 
  USING (auth.uid() = user_id);

-- Policy for user_favorites: Users can only access their own favorites
CREATE POLICY "Users can manage their own favorites" 
  ON user_favorites FOR ALL 
  USING (auth.uid() = user_id);

-- Drop the insecure policy first (if it exists)
DROP POLICY IF EXISTS "Users can read all profiles" ON public.user_profiles;

-- Create the secure policy
CREATE POLICY "Users can read their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Ensure the update policy is still correct
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create sample hooks data - **ASSIGN ACTUAL UUIDs HERE**
-- Generate UUIDs using an online tool or function like uuid_generate_v4()
INSERT INTO hooks (id, text, niche, tone, length, ai_generated)
VALUES
  ('YOUR_GENERATED_UUID_1', 'Struggling to get views on your YouTube videos? This forgotten tactic increased my CTR by 237% overnight...', 'Marketing', 'Curious', 'Medium', FALSE),
  ('YOUR_GENERATED_UUID_2', 'I almost gave up on Facebook Ads until I discovered this weird trick that reduced my CPC from $4.25 to only $0.62...', 'Marketing', 'Surprising', 'Medium', FALSE),
  ('YOUR_GENERATED_UUID_3', 'The "Potato Hack" helping thousands lose weight without giving up their favorite foods', 'Health', 'Intriguing', 'Short', FALSE),
  ('YOUR_GENERATED_UUID_4', 'Why most morning routines actually sabotage your productivity (and what to do instead)', 'Productivity', 'Counterintuitive', 'Medium', FALSE),
  ('YOUR_GENERATED_UUID_5', 'The $7 tool professional copywriters use to write emails that convert at 28%+', 'Marketing', 'Curious', 'Short', FALSE),
  ('YOUR_GENERATED_UUID_6', 'Stop apologizing for these 5 things (unless you want people to lose respect for you)', 'Personal Development', 'Direct', 'Short', FALSE),
  ('YOUR_GENERATED_UUID_7', 'What Netflix secretly learned about your brain (and how they use it to keep you watching)', 'Entertainment', 'Mysterious', 'Medium', FALSE),
  ('YOUR_GENERATED_UUID_8', 'Here\''s why successful people wear the same outfit every day (it\''s not what you think)', 'Productivity', 'Surprising', 'Medium', FALSE),
  ('YOUR_GENERATED_UUID_9', 'This 1926 productivity method is still used by top CEOs (takes just 10 minutes daily)', 'Productivity', 'Fascinating', 'Medium', FALSE),
  ('YOUR_GENERATED_UUID_10', 'The uncomfortable truth about AI nobody is talking about', 'Technology', 'Controversial', 'Short', FALSE); 