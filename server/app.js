import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRouter.js';
import bookRouter from './routes/bookRouter.js';
import favoritesRouter from './routes/favoritesRouter.js';
import commentRouter from "./routes/commentRouter.js";
import commentReactionRouter from "./routes/commentReactionRouter.js";
import authRouter from "./routes/authRouter.js";
import contactRouter from "./routes/contactRouter.js";
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
app.use("/comments", commentRouter);
app.use("/comment-reactions", commentReactionRouter);
app.use("/contact", contactRouter);
app.use("/api/auth", authRouter);

// Error handling
app.use(errorHandler);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
