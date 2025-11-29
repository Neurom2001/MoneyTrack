import { Transaction, TransactionType } from '../types';
import { supabase } from './supabaseClient';

// Helper to convert username to a fake email for Supabase Auth
// Since Supabase requires email, but you want "username" login.
const getEmail = (username: string) => `${username}@burmesetracker.app`;

export const registerUser = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
  const { data, error } = await supabase.auth.signUp({
    email: getEmail(username),
    password: password,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: getEmail(username),
    password: password,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, user: data.user };
};

export const logoutUser = async () => {
  await supabase.auth.signOut();
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data as Transaction[];
};

export const saveTransaction = async (transaction: Transaction): Promise<Transaction | null> => {
  // We don't send ID, created_at, or user_id (Supabase handles these)
  // We need to get the current user first to ensure session is active, though RLS handles it
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: user.id,
        amount: transaction.amount,
        label: transaction.label,
        date: transaction.date,
        type: transaction.type
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving transaction:', error);
    return null;
  }
  return data;
};

export const updateTransaction = async (transaction: Transaction): Promise<boolean> => {
  const { error } = await supabase
    .from('transactions')
    .update({
      amount: transaction.amount,
      label: transaction.label,
      date: transaction.date,
      type: transaction.type
    })
    .eq('id', transaction.id);

  if (error) {
    console.error('Error updating transaction:', error);
    return false;
  }
  return true;
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
  return true;
};