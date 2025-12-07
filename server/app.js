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
import categoryRouter from './routes/categoryRouter.js';
import loansRouter from './routes/loansRouter.js';
import userCopiesRouter from './routes/userCopiesRouter.js';
import { errorHandler } from './middleware/errorHandler.js';
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use("loans", loansRouter);
app.use("userCopies", userCopiesRouter);



// Error handling
app.use(errorHandler);

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
