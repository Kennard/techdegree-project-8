const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500);
      res.render('error');
    }
  }
}

/* GET Home route. Pagination*/
router.get('/', asyncHandler(async (req, res) => { 

const page = parseInt(req.query.page) || 1;  
const limit =  8;
const offset = (page - 1) * limit;

const books  = await Book.findAll({
  offset,
  limit
});

const allbooks  = await Book.findAll();
const totalBooks = allbooks.length;
const lastpage = Math.ceil(totalBooks / limit);

//Conditional layer on top if pagination number changed in URI 
  if(page > lastpage){
     res.status(404).render("books/not-found", {title: "Page Not Found"});
  }else {
    if(books){  
      res.render("books", { books, title: "Books", page, lastpage });
    }else{
      res.status(404).render("books/not-found", {title: "Page Not Found"});
    }
}

}));


/* GET - Shows full list of books. */
router.get('/books/:page', asyncHandler(async (req, res) => {
  res.render("books");
}));


/* GET - Shows the Create a new book form. */
router.get('/new', (req, res) => {
  res.render("books/new", { book: {}, title: "New Book" });
});

/* GET - Search Term Query - If not return page not found. */
router.get('/search', asyncHandler(async (req ,res) => {
  const term = req.query.term;
  
  if(term){
   const books = await Book.findAll({ 
    where: {
      [Op.or]: [ 
        { title: { [Op.like]: '%'+term+'%' } },
        { author: { [Op.like]: '%'+term+'%' } },
        { genre: { [Op.like]: '%'+term+'%' } },
        { year:  { [Op.like]: '%'+term+'%' } }
        ]
      }
   });

  res.render("books/search", { books, title: "Search Results" }); 
 } else{
  res.status(404).render("books/not-found", {title: "Page Not Found"});
 } 
}));

/* POST - Post a new book to the database. */
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try{
      book = await Book.create(req.body);
      res.redirect("/books");
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
    res.render("books/update", { book, title: "Update Book"});
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
      res.redirect("/books");
    }else {
      res.status(404).render("books/not-found", {title: "Page Not Found"});
    }
  } catch(error){
    if(error.name === "SequelizeValidationError"){
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("books/update", {book, errors: error.errors, title: "Edit Book" })
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