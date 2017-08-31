var mongoose = require ("mongoose");
var Schema = mongoose.Schema;

var newOrderSchema = new Schema ({
    email: {type: String, required: true},
    name: {type:String},
    cart: {type: Object, required:true}, // storing the whole cart, so set it as type object
    paymentID: {type:String, required:true}, // payment id refers to the id of payment found under payment details in Stripe
    datePlaced: {type: Date, default:Date.now},
    address: {type: String, required:true}
});

module.exports = mongoose.model ("newOrder", newOrderSchema);
