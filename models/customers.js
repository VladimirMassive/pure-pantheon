var mongoose = require ("mongoose");
var Schema = mongoose.Schema;

var customerSchema = new Schema ({
    email: {type:String, required:true}
});

module.exports = mongoose.model ("Customer", customerSchema);
