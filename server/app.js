import dotenv from 'dotenv'
import cors from 'cors';
import express from 'express';

const app = express();
dotenv.config()
app.use(cors());


import './db/test.js';