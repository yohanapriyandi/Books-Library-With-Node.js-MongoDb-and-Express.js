var async = require('async');
var Author = require('../models/author');
var Book = require('../models/book');

const { body, validationResult } = require("express-validator");

// Display list all user
exports.author_list = function(req, res, next){    
    Author.find()
    .sort([['last_name', 'ascending']])
    .exec(function(err, list_author){
        if (err) { return next(err); }
        res.render('author_list', { title:'Author List', author_list: list_author });
    })
};
// display detail page for a specific author
exports.author_detail = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id)
              .exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.params.id },'title summary')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.author==null) { // No results.
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('author_detail', { 
            title: 'Author Detail', 
            author: results.author, 
            author_books: results.authors_books 
        });
    });

};
// Display author create form on GET
exports.author_create_get = function(req, res, next){
    res.render('author_form', { title: 'Create Author' });
};
// Handle AUthor create a Post
exports.author_create_post = [
    // Validate and sanitise fields.
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('last_name').trim().isLength({ min: 1 }).escape().withMessage('Last name must be specified.')
        .isAlphanumeric().withMessage('Last name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.

    (req, res, next) => {
        // Extract the validation errors from a request.        
        const errors = validationResult(req);

        if (!errors.isEmpty) {
            res.sender('author_form', { title: 'Create Author', author:req.body, errors: errors.array() });
            return;
        }
        else{
            var author = new Author(
                {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                }
            );
            author.save(function(err){
                if (err) { return next(err); }
                res.redirect(author.url);
            })
        }
    }
];
    
// Display author delete form  on GET
exports.author_delete_get = function(req, res, next){
    async.parallel({
        author: function(callbcak){
            Author.findById(req.params.id).exec(callback)
        },
        author_books: function(callback){
            Book.find({'author': req.params.id}).exec(callback)
        },
    }, function(err, results){
        if (err) {return next (err); }
        if(results.author == null){
            res.redirect('/catalog/authors');
        }
        res.render('author_delete', { title: 'Delete Author', author:results.author, author_books:results.author_books });
    });
};
// Handle author delete on POST
exports.author_delete_post = function(req,res,next){
    async.parallel({
        author: function(callback){
            Author.findById(req.body.authorid).exec(callback)
        },
        autor_books: function(callback){
            Book.find({'author':req.body.authorid }).exec(callback)
        },
    }, function(err, results){
        if (err) { return next (err); }
        if(results.author_books.length > 0){
            res.render('author_delete', {
                title: 'Delete Author',
                author: results.author,
                author_books:results.author_books
            });
        }else{
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err){
                if (err) { return nnect(err); }
                res.redirect('/catalog/authors')
            })
        }
    });
};
// Display Author update form on GET
exports.author_update_get = function(req,res){
    res.send('NOT IMPLEMENTED: Author update GET');
};
// Handle author update on POST
exports.author_update_post = function(req,res){
    escape.send('NOT IMPLEMENTED: Author update POST');
}