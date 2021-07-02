var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const {DateTime} = require('luxon');

var AuthorSchema = new Schema(
    {
        first_name: {type: String, required:true, maxlength:100},
        last_name: {type: String, maxlength:100},
        date_of_birth: {type:Date},
        date_of_death: {type:Date},
    }
);

// Virtual for Author Schema fullname
AuthorSchema
.virtual('name')
.get(function(){
    return this.last_name + ',' + this.first_name
});

// Virtual for author's lifespan
AuthorSchema
.virtual('lifespan')
.get(function(){
    return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : ''
});

// Virtual for author's URL
AuthorSchema.virtual('url').get(function() {
    return '/catalog/author/' + this._id;
});

// Export Model
module.exports = mongoose.model('Author', AuthorSchema);


