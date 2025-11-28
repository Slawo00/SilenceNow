/**
 * Supabase Client Placeholder
 * 
 * This file is prepared for future Supabase integration.
 * Currently, the app uses AsyncStorage for local data persistence.
 * 
 * When ready to integrate Supabase:
 * 1. Install the Supabase client: npm install @supabase/supabase-js
 * 2. Get your Supabase URL and Anon Key from your Supabase project dashboard
 * 3. Uncomment and configure the client below
 */

// =============================================================================
// SUPABASE CLIENT SETUP (Uncomment when ready to integrate)
// =============================================================================

// import { createClient } from '@supabase/supabase-js';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
// const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage: AsyncStorage,
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: false,
//   },
// });

// =============================================================================
// DATABASE SCHEMA (Create these tables in Supabase)
// =============================================================================

/**
 * Table: users
 * ---------------------------
 * id: uuid (primary key, references auth.users)
 * email: text
 * company_size: text
 * primary_goal: text
 * close_duration: integer
 * onboarding_completed: boolean
 * created_at: timestamp with time zone
 * updated_at: timestamp with time zone
 * 
 * SQL:
 * CREATE TABLE users (
 *   id UUID PRIMARY KEY REFERENCES auth.users(id),
 *   email TEXT,
 *   company_size TEXT,
 *   primary_goal TEXT,
 *   close_duration INTEGER,
 *   onboarding_completed BOOLEAN DEFAULT FALSE,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 */

/**
 * Table: user_plans
 * ---------------------------
 * id: uuid (primary key)
 * user_id: uuid (references users.id)
 * goal_id: text
 * goal_title: text
 * lever_id: text
 * lever_title: text
 * impact: text
 * complexity: text
 * status: text (Planned, In progress, Done)
 * added_at: timestamp with time zone
 * updated_at: timestamp with time zone
 * 
 * SQL:
 * CREATE TABLE user_plans (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 *   goal_id TEXT NOT NULL,
 *   goal_title TEXT NOT NULL,
 *   lever_id TEXT NOT NULL,
 *   lever_title TEXT NOT NULL,
 *   impact TEXT,
 *   complexity TEXT,
 *   status TEXT DEFAULT 'Planned',
 *   added_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 */

// =============================================================================
// AUTH HELPER FUNCTIONS (Uncomment when ready)
// =============================================================================

/**
 * Sign up a new user
 * 
 * export async function signUp(email: string, password: string) {
 *   const { data, error } = await supabase.auth.signUp({
 *     email,
 *     password,
 *   });
 *   return { data, error };
 * }
 */

/**
 * Sign in an existing user
 * 
 * export async function signIn(email: string, password: string) {
 *   const { data, error } = await supabase.auth.signInWithPassword({
 *     email,
 *     password,
 *   });
 *   return { data, error };
 * }
 */

/**
 * Sign out the current user
 * 
 * export async function signOut() {
 *   const { error } = await supabase.auth.signOut();
 *   return { error };
 * }
 */

/**
 * Get the current user session
 * 
 * export async function getSession() {
 *   const { data: { session }, error } = await supabase.auth.getSession();
 *   return { session, error };
 * }
 */

// =============================================================================
// USER PROFILE FUNCTIONS (Uncomment when ready)
// =============================================================================

/**
 * Create or update user profile
 * 
 * export async function upsertUserProfile(userId: string, profile: {
 *   email?: string;
 *   company_size?: string;
 *   primary_goal?: string;
 *   close_duration?: number;
 *   onboarding_completed?: boolean;
 * }) {
 *   const { data, error } = await supabase
 *     .from('users')
 *     .upsert({ id: userId, ...profile, updated_at: new Date().toISOString() })
 *     .select()
 *     .single();
 *   return { data, error };
 * }
 */

/**
 * Get user profile
 * 
 * export async function getUserProfile(userId: string) {
 *   const { data, error } = await supabase
 *     .from('users')
 *     .select('*')
 *     .eq('id', userId)
 *     .single();
 *   return { data, error };
 * }
 */

// =============================================================================
// USER PLAN SYNC FUNCTIONS (Uncomment when ready)
// =============================================================================

/**
 * Sync user's plan to Supabase
 * 
 * export async function syncPlanToCloud(userId: string, planItems: Array<{
 *   goalId: string;
 *   goalTitle: string;
 *   leverId: string;
 *   leverTitle: string;
 *   impact: string;
 *   complexity: string;
 *   status: string;
 *   addedAt: string;
 * }>) {
 *   // First, delete existing plan items for this user
 *   await supabase.from('user_plans').delete().eq('user_id', userId);
 *   
 *   // Then insert the new plan items
 *   const { data, error } = await supabase
 *     .from('user_plans')
 *     .insert(planItems.map(item => ({
 *       user_id: userId,
 *       goal_id: item.goalId,
 *       goal_title: item.goalTitle,
 *       lever_id: item.leverId,
 *       lever_title: item.leverTitle,
 *       impact: item.impact,
 *       complexity: item.complexity,
 *       status: item.status,
 *       added_at: item.addedAt,
 *     })));
 *   return { data, error };
 * }
 */

/**
 * Fetch user's plan from Supabase
 * 
 * export async function fetchPlanFromCloud(userId: string) {
 *   const { data, error } = await supabase
 *     .from('user_plans')
 *     .select('*')
 *     .eq('user_id', userId)
 *     .order('added_at', { ascending: true });
 *   return { data, error };
 * }
 */

// =============================================================================
// PLACEHOLDER EXPORT (Remove when Supabase is integrated)
// =============================================================================

export const supabaseReady = false;

export const supabasePlaceholder = {
  message: 'Supabase integration is not yet active. See this file for setup instructions.',
  docsUrl: 'https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native',
};
