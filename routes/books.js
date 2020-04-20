const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

/* GET Home route. */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll(); 
  if(books){
    res.render("books", { books, title: "Books" });
  }else{
    res.status(404).render("books/not-found", {title: "Page Not Found"});
  }
}));

/* GET - Shows full list of books. */
router.get('/books', asyncHandler(async (req, res) => {
      res.render("books", {  title: "Books" });
}));

/* GET - Shows the Create a new book form. */
router.get('/new', (req, res) => {
  res.render("books/new", { book: {}, title: "New Book" });
});

/* POST - Post a new book to the database. */
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try{
      book = await Book.create(req.body);
      res.redirect("/books/" + book.id);
  } catch(error){
    if(error.name === "SequelizeValidationError"){
      book = await Book.build(req.body);
      res.render("books/new", {book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }
  }
}));

// /* GET - Shows book detail form. */
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book){
    res.render("books/detail", { book, title: "Update Book"});
  } else{
      res.status(404).render("books/not-found", {title: "Page Not Found"});
  }
}));

// /* POST - Updates books info in the database. */
router.post("/:id", asyncHandler(async (req, res) => {
  let book;
  try{
    book = await Book.findByPk(req.params.id);
    if(book){
      await book.update(req.body);
      res.redirect("/books/" + book.id);
    }else {
      res.status(404).render("books/not-found", {title: "Page Not Found"});
    }
  } catch(error){
    if(error.name === "SequelizeValidationError"){
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("books/detail", {book, errors: error.errors, title: "Edit Book" })
    } else {
      throw error;
    }
  }
  
}));

// /* POST - Delete a book. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books");
  }else {
    res.status(404).render("books/not-found", {title: "Page Not Found"});
  }
  
}));



module.exports = router;