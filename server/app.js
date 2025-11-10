// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { verifyJWT } from './middleware/auth.js';
dotenv.config();
import userRoutes from './routes/userRouter.js';
import bookRouter from './routes/bookRouter.js';
import categoryRouter from './routes/categoryRouter.js';
const app = express();

// Middleware
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/user', userRoutes);
app.use('/books', bookRouter);
app.use('/categories', categoryRouter);


// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
