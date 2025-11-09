// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRouter.js';
import { verifyJWT } from './middleware/auth.js';
dotenv.config();
import bookRouter from './routes/bookRouter.js';

const app = express();

// Middleware
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', userRoutes);
app.use('/books', verifyJWT, bookRouter);
// app.use('/books', bookRouter);


// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
