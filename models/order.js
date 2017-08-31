var mongoose = require ("mongoose");
var Schema = mongoose.Schema;

var orderSchema = new Schema ({
    //user: {type: Schema.Types.ObjectId, ref: "User"}, // This field will hold an ID referring to the user object we created with the user model
    // the ref key sets up a reference to the user model.
    email: {type: String, required: true},
    cart: {type: Object, required:true}, // storing the whole cart, so set it as type object
    paymentID: {type:String, required:true}, // payment id refers to the id of payment found under payment details in Stripe\
    timePlaced: {type: Date, default: Date.now}
});

module.exports = mongoose.model ("Order", orderSchema);