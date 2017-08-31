var mongoose = require ("mongoose");
var Schema = mongoose.Schema;

var codeSchema = new Schema ({
    code: {type: String, required:true},
    discount: {type: Number, default:10}
});

module.exports = mongoose.model ("Code", codeSchema);

