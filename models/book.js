var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookSchema = new Schema(
    {
        title: {type:String, require:true, maxlength:100},
        author: {type:Schema.Types.ObjectId, ref:'Author', required:true},
        summary: {type:String, required:true},
        isbn:{type:String, require:true},
        genre:[{type:Schema.Types.ObjectId, ref:'Genre'}]
    }
);

//Virtual for books url's
BookSchema
.virtual('url') 
.get(function(){
    return '/catalog/book/' + this._id;
});

BookSchema
.virtual('due_back_formatted')
.get(function () {
    return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

// Export Model
BookSchema
module.exports = mongoose.model('Book', BookSchema);