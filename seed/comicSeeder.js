var mongoose = require ("mongoose");
var Comic = require ("../models/comics");

mongoose.connect ("localhost:27017/profiles");
mongoose.Promise = global.Promise;

var comics = [
    new Comic ({
        title: "Secret Santa",
        contentPath: "/images/Alexander.jpg"
    })
];

var done = 0;

for (var i = 0; i < comics.length; i++) {
    comics[i].save (function (err, result) {
        done++;
        if (done === comics.length) {
            exit();
        }
    })
}

function exit () {
    mongoose.disconnect();
}