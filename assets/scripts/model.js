var mongoose = require('mongoose'),
    Schema= mongoose.Schema;

var CommentSchema = new Schema({
 		author: String,
 		date: { type: Date, default: Date.now },
 		message: String,
 		upvotes: Number
});

module.exports = mongoose.model('comment',CommentSchema,'comment');