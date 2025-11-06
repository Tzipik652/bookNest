// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import supabase from './config/supabaseClient.js';
import { verifyJWT } from './middleware/auth.js';
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);

// Example of a protected route
app.get('/api/profile', verifyJWT, async (req, res) => {
  res.json({ user: req.user });
});

// Example route for AI recommendations
app.get('/api/recommendations', verifyJWT, async (req, res) => {
  res.json({ message: `AI recommendations for ${req.user.email}` });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const testConnection = async () => {
  try {
    // בדיקה פשוטה: שליפת 1 משתמש מהטבלה 'users'
    const { data, error } = await supabase
      .from('users')    // ← שם הטבלה ב-Supabase
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying Supabase:', error);
    } else {
      console.log('Supabase connection successful, data:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
};

testConnection();