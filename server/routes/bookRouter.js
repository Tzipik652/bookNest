import express from 'express';
import { createBook, deleteBook, getAllBooks, getBookById, getBooksByCategory, getBooksByUserId, searchBooks, updateBook } from '../controllers/bookConroller.js';
import { verifyJWT } from '../middleware/auth.js';
const router = express.Router();

router.get('/', getAllBooks);
router.post('/',verifyJWT, createBook);
// router.get('/page',getBooksByPage);
///books/search?s=harry&page=1
router.get('/search',(req,res)=> console.log("in searc") ,searchBooks);
///books/category/:catName
router.get('/category/:catName',getBooksByCategory);
router.get('/user/:userId',verifyJWT, getBooksByUserId);
router.get('/:id',getBookById);
router.put('/:id',verifyJWT, updateBook);
router.delete('/:id',verifyJWT, deleteBook);


export default router;