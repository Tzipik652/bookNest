// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import { verifyJWT } from './middleware/auth.js';
dotenv.config();
import bookRouter from './routes/bookRouter.js';

const app = express();

// Middleware
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
// app.use('/books', verifyJWT, bookRouter);
app.use('/books', bookRouter);


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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
