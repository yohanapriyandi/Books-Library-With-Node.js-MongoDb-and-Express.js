var Book = require('../models/book');
var Author = require('../models/author');
var BookInstance = require('../models/bookinstance');
var Genre = require('../models/genre');

var async =  require('async');

const { body, validationResult } = require("express-validator");

exports.index = function(req,res){
    // res.send('NOT IMPLEMENTED: Site Home Page');
    async.parallel({
        book_count: function(callback){
            // Pass an empty object as match condition to find all documents of this collection
            Book.countDocuments({}, callback);
        },
        book_instance_count: function(callback){
            BookInstance.countDocuments({}, callback);
        },
        book_instance_availabe_count:function(callback){
            BookInstance.countDocuments({status:'Available'}, callback);
        },
        author_count:function(callback){
            Author.countDocuments({}, callback);            
        },
        genre_count:function(callback){
            Genre.countDocuments({}, callback);
        }
    }, function(err, results){
        res.render('index', {title:'Local Library Home', error:err, data:results});
    });
};

// display lis of all book
exports.book_list = function(req,res, next){    
    Book.find({}, 'title author')
    .populate('author')
    .exec(function(err, list_book){
        if (err){return next(err);}
        res.render('book_list', {title:'Book List', book_list:list_book});
    });
};
// display detail page for a specific book
exports.book_detail = function(req, res, next){
    async.parallel({
        book: function(callback){
            Book.findById(req.params.id)
            .populate('author')
            .populate('genre')
            .exec(callback);
        },
        book_instance: function(callback){
            BookInstance.find({'book': req.params.id})
            .exec(callback);
        },
    }, function(err, results){
        if (err) { return next(err);}
        if (results.book == null){
            var err = new Error('Book Not Found');
            err.status = 404;
            return next(err);
        }
        res.render('book_detail', { 
            title:results.book.title, 
            book:results.book, 
            book_instance:results.book_instance 
        });
    });
};
// display book create form on GET
exports.book_create_get = function(req, res, next){
    async.parallel({
        authors: function(callback){
            Author.find(callback);
        },
        genres: function(callback){
            Genre.find(callback);
        },
    }, function(err, results) {
        if(err) { return next(err); }
        res.render('book_form', { 
            title: 'Create Book', 
            authors: results.authors, 
            genres: results.genres 
        });
    });
};
// display book create form on POST
exports.book_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Validate and sanitize fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { 
                    title: 'Create Book',
                    authors:results.authors, 
                    genres:results.genres, 
                    book: book, 
                    errors: errors.array() 
                });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            book.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new book record.
                   res.redirect(book.url);
                });
        }
    }
];
// display book update form on GET
exports.book_update_get = function(req, res, next){
    async.parallel({
        book: function(callback){
            Book.findById(req.params.id)
            .populate('author')
            .populate('genre')
            .exec(callback);
        },
        authors: function(callback){
            Author.find(callback);
        },
        genres: function(callback){
            Genre.find(callback);
        },
    }, function(err, results){
        if (err) { return next(err); }
        if (results.book == null){
            var err = new Error('Book Not Found');
            err.status = 404;
            return next(err);
        }
        // SUCCESS
        for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++){
            for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++){
                if(results.genres[all_g_iter]._id.toString() === results.book.genre[book_g_iter]._id.toString()){
                    results.genres[all_g_iter].checked = 'true';
                }
            }
        }
        res.render('book_form', { 
            title: 'Update Book',
            authors: results.authors,
            genres: results.genres,
            book: results.book
        })
    });
};
// display book update form on POST
exports.book_update_post = [
    // Convert Genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if (typeof req.body.genre === 'undefined')
                req.body.genre = [];
            else
                req.body.genre = new Array(req.body.genre);
        }
        next();
    },
    // validate anda sanitise field
    body('title', 'Title must not be empty.').trim().isLength( { min: 1 } ).escape(),
    body('author', 'author must not be empty.').trim().isLength( { min: 1 } ).escape(),
    body('summary', 'summary must not be empty.').trim().isLength( { min: 1 } ).escape(),
    body('isbn', 'isbn must not be empty.').trim().isLength( { min: 1 } ).escape(),
    body('genre.*').escape(),

    // process request after after validation and sanitization
    (req, res, next) => {
        const errors = validationResult(req);
        // Create Book object with escaped/trimmed data and old id.
        var book = new Book(
            {
                title: req.body.title,
                author: req.body.author,
                summary: req.body.summary,
                isbn: req.body.isbn,
                genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre, _id: req.params.id
            });
        if (!errors.isEmpty()){
            async.parallel({
                authors: function(callbacl){
                    Author.find(callback)
                },
                genres: function(callback){
                    Genre.find(callback)
                },
            }, function (err, results){
                if (err) { return next(err); }
                for (let i=0; i < results.genres.length; i++){
                    if (book.genre.indexOf(results.genres[i]._id) > -1){
                        results.genres[i].checked = 'true';
                    }
                }
                res.render('book_form', { title: 'Update Book',authors: results.authors, genres: results.genres, book: book, errors: errors.array() })
            });
            return;
        }else{
            Book.findByIdAndUpdate(req.params.id, book, {}, function(err, thebook){
                if (err) { return next(err); }
                res.redirect(thebook.url);
            });
        }
    }
]
// display book delete form on GET
exports.book_delete_get = function(req, res){
    res.send('NOT IMPLEMENTED: Book delete GET');
};
// display book delete form on POST
exports.book_delete_post = function(req, res){
    res.send('NOT IMPLEMENTED: Book delete POST');
};
