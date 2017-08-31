var mongoose = require ("mongoose");
var Schema = mongoose.Schema;

var articleSchema = new Schema ({
    imagePath: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: String, required: true},
    comments: {type: [String]},
    users: {type: [String]},
    replies: {type: [String]},
    userReplyToMessage: {type: [String]},
    allowComments: {type:Boolean, default:true}
});

module.exports = mongoose.model ("Article", articleSchema);