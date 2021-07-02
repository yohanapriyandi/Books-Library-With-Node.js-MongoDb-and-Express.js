var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');

const { body, validationResult } = require("express-validator");

// Display list of all genre
exports.genre_list = function(req,res){
    Genre.find()
    .sort([['name', 'ascending']])
    .exec(function(err, list_genres){
        if (err) { return next(err); }
        res.render('genre_list', {title:'Genre List', genre_list:list_genres});
    });
};
// dispaly detail page for a speciific Genre
exports.genre_detail = function(req,res,next){
    async.parallel({
        genre: function(callback){
            Genre.findById(req.params.id)
                .exec(callback);
        },
        genre_books: function(callback){
            Book.find({'genre': req.params.id})
                .exec(callback);
        }
    }, function(err, results){
        if (err) {return next(err);}
        if (results.genre == null){
            var err = new Error('Genre Not Found');
            err.status = 404;
            return next(err);
        }
        res.render('genre_detail', {title:'Genre Detail', genre:results.genre, genre_books:results.genre_books});
    });
};
// Display Genre create form on GET
exports.genre_create_get = function(req, res, next) {
    res.render('genre_form', { title: 'Create Genre' });
};
// Display Genre create form on POST
exports.genre_create_post = [
     // Validate and santise the name field.
    body('name', 'Genre name must contain at least 3 characters').trim().isLength({ min: 3 }).escape(),
     // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a genre object with escaped and trimmed data.
        var genre = new Genre (
            { name: req.body.name }
        );

        if ( !errors.isEmpty() ) {
             // There are errors. Render the form again with sanitized values/error messages.
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() });
            return;
        }
        else{
            // Data from form is valid.
            // Check if Genre with same name already exists.
            Genre.findOne({ 'name': req.body.name })
                .exec(  function(err, found_genre){
                    if (err) { return next(err); }

                    if (found_genre) {
                        // Genre exists, redirect to its detail page.
                        res.redirect(found_genre.url);
                    }
                    else{
                        genre.save(function (err){
                            if (err) { return next(err); }
                            // Genre saved. Redirect to genre detail page.
                            res.redirect(genre.url);
                        });
                    }
                });
        }
    }
];
// Display Genre update form on GET
exports.genre_update_get = function(req,res){
    res.send('NOT IMPLEMENTED: Genre update GET');
};
// Display Genre update form on POST
exports.genre_update_post = function(req,res){
    res.send('NOT IMPLEMENTED: Genre update POST');
};
// Display Genre delete form on GET
exports.genre_delete_get = function(req,res){
    res.send('NOT IMPLEMENTED: Genre delete GET');
};
// Display Genre delete form on POST
exports.genre_delete_post = function(req,res){
    res.send('NOT IMPLEMENTED: Genre delete POST');
};