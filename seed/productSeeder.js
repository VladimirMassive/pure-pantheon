var Product = require ("../models/product");
var mongoose = require ("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect ("localhost:27017/profiles");

var products = [
  new Product ({
      imagePath: "/images/bottle-front.jpg",
      title: "ATLAS STRENGTH",
      description: "Pure Pantheon Pre-Workout",
      stockQuantity: 48,
      price: 29.99
  })
];

var done = 0;

for (var i = 0; i < products.length; i++) {
    products[i].save (function (err, product) {
        done++;
        if (done === products.length) {
            exit ();
        }
    })
}

function exit () {
    mongoose.disconnect();
}