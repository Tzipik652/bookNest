import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const getAllCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, created_at')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};