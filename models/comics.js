var mongoose = require ("mongoose");
var Schema = mongoose.Schema;

var comicSchema = new Schema ({
    title: {type: String, required:true},
    contentPath: {type: String, required:true}
});

module.exports = mongoose.model ("Comic", comicSchema);