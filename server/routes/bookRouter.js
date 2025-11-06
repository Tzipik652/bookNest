import express from 'express';
import { createBook, deleteBook, getAllBooks, getBookById, getBooksByCategory, getBooksByUserId, searchBooks, updateBook } from '../controllers/bookConroller.js';
const router = express.Router();

router.get('/',getAllBooks);
router.post('/',createBook);
// router.get('/page',getBooksByPage);
///books/search?s=harry&page=1
router.get('/search',(req,res)=> console.log("in searc") ,searchBooks);
///books/category/:catName
router.get('/category/:catName',getBooksByCategory);
router.get('/user/:userId',getBooksByUserId);
router.get('/:id',getBookById);
router.put('/:id',updateBook);
router.delete('/:id',deleteBook);


export default router;