import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get data from a table
export const getData = async (table) => {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data;
};

// Helper function to insert data into a table
export const insertData = async (table, values) => {
    const { data, error } = await supabase.from(table).insert(values);
    if (error) throw error;
    return data;
};

// Add more functions as needed
