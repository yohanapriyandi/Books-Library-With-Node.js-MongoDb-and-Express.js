var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GenreSchema = new Schema(
    {
        name: {type:String, minlength:3, maxlength:100}
    }
);

// Virtual for Genre url's
GenreSchema
.virtual('url')
.get(function(){
    return '/catalog/genre/'+ this._id;
});
// Model export
module.exports = mongoose.model('Genre', GenreSchema);