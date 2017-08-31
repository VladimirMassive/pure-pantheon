var mongoose = require ("mongoose");
var Schema = mongoose.Schema;

var recentThreadSchema = new Schema ({
    threadName: {type:String},
    threadID: {type: String},
    comments: {type: Number}
});

module.exports = mongoose.model ("recentThread", recentThreadSchema);