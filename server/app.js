import dotenv from 'dotenv'
import cors from 'cors';
import express from 'express';
import http from 'http';
import bookRouter from './routes/bookRouter.js';
// import './db/test.js';

const app = express();
dotenv.config()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/books', bookRouter);

const server=http.createServer(app);
const PORT=process.env.PORT || 3000;
server.listen(PORT,()=>console.log(`Server is running on port ${PORT}`));
