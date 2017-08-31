var mongoose = require ("mongoose");
var Article = require ("../models/article");

mongoose.Promise = global.Promise;
mongoose.connect ("localhost:27017/profiles");

var articles = [
    new Article ({
        imagePath: "/images/Logo.jpg",
        title: "You mad brah?",
        description: "We all know about the popular myth of raging out while cycling. Is there any truth to it? What about any other emotions?",
        content: "1",
        author: "VladimirMassive"
    }),
    new Article ({
        imagePath: "/images/Logo.jpg",
        title: "2?",
        description: "We all know about the popular myth of raging out while cycling. Is there any truth to it? What about any other emotions?",
        content: "2",
        author: "VladimirMassive"
    })
];

var done = 0;
for (var i = 0; i < articles.length; i++) {
    articles[i].save (function (err, result){
        done++;
        if (done === articles.length) {
            exit(); // have to it this way because of node's asynchronous nature
        }
    });
}

function exit () {
    mongoose.disconnect();
}

