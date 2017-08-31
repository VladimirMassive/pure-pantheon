var mongoose = require ("mongoose");
var Schema = mongoose.Schema;

var vladSchema = new Schema ({
    title: {type: String, required: true},
    content: {type: String, required: true}
});

module.exports = mongoose.model ("Vlad", vladSchema);