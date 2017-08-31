var mongoose = require ("mongoose");
var Schema = mongoose.Schema;

var threadSchema = new Schema ({
   threadName: {type: String},
   comments: {type: [String]},
   users: {type: [String]},
   descriptions: {type: [String]}, // will store description of all users that post in thread
   profilePics: {type: [String]},
   replies: {type: [String]},
   userReplyToMessage: {type: [String]}
});

module.exports = mongoose.model ("Thread", threadSchema);