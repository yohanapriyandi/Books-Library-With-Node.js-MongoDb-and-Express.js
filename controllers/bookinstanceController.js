var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
const { body, validationResult } = require("express-validator");

// Display lists of all book instance
exports.bookinstance_list = function(req,res, next){
    // res.send('NOT IMPLEMENTED: Book Instance List');
    BookInstance.find()
        .populate('book')
        .exec(function(err, list_bookinstances){
            if (err){ return next(err); }
            res.render('bookinstance_list', {
                title: 'Book Instance List', 
                bookinstance_list: list_bookinstances
            })
        });
};
// display detail page for a specific BookInstance
exports.bookinstance_detail = function(req,res,next){
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function(err, bookinstance){
            if (err) { return next(err); }
            if (bookinstance == null){
                var err = new Error('Book copy no found');
                err.status = 404;
                return next(err);
            }
            res.render('bookinstance_detail', {title: 'Copy: ' +bookinstance.book.title, bookinstance: bookinstance});
        })
};
// Display BookInstance create form on GET
exports.bookinstance_create_get = function(req,res,next){
    Book.find({}, 'title')
        .exec(function (err, books){
            if (err) { return next (err); }
            res.render('bookinstance_form', {
                title:'Create Book Instance', 
                book_list: books
            });
        });
};
// Handle BookInstance create on POST
exports.bookinstance_create_post = [
    // validate and sanitize fields
    body('book', 'Book must be spepcified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be spepcified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

    (req,res,next) => {
        const errors =  validationResult(req);

        var bookinstance = new BookInstance(
            {
                book: req.body.book,
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back
            });
            if (!errors.isEmpty()){
                Book.find({}, 'title')
                    .exec(function (err, books){
                        if (err) { return next(err); }
                        res.render('bookinstance_form', { 
                            title:'Create Book Instance',
                             book_list: books, 
                             selected_book: bookinstance.book._id ,
                             errors: errors.array(),
                             bookinstance: bookinstance });
                    });
                    return;
            }else{
                bookinstance.save(function (err){
                    if (err) { return next(err); }
                    res.redirect(bookinstance.url);
                });
            }                    
    }
];
// Display BookInstance delete form  on GET
exports.bookinstance_delete_get = function(req,res){
    res.send('NOT IMPLEMENTED: Book Instance delete GET');
};
// Handle Bookinstance delete on POST
exports.bookinstance_delete_post = function(req,res){
    res.send('NOT IMPLEMENTED: Book Instance delete POST');
};
// Display BookInstance update form on GET
exports.bookinstance_update_get = function(req,res){
    res.send('NOT IMPLEMENTED: Book Instance update GET');
};
// Handle BookInstance update on POST
exports.bookinstance_update_post = function(req,res){
    res.send('NOT IMPLEMENTED: Book Instance upadte POST');
};