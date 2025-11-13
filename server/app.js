import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRouter.js';
import bookRouter from './routes/bookRouter.js';
import favoritesRouter from './routes/favoritesRouter.js';
import { errorHandler } from './middleware/errorHandler.js';
dotenv.config();


import categoryRouter from './routes/categoryRouter.js';
const app = express();

// Middleware
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/user', userRoutes);
app.use('/books', bookRouter);
app.use('/favorites', favoritesRouter);
app.use('/categories', categoryRouter);


// Error handling
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
