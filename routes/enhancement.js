var express = require('express');
var router = express.Router();
var Article = require ("../models/article");
var User = require ("../models/user");
var multer = require ("multer");

var pageNum;
var avatar;
var title;

var storage = multer.diskStorage ({
    destination: function (req, file, cb) {
        cb (null, "public/article-uploads/");
    },
    filename: function (req, file, cb) {
        avatar = file.fieldname + "-" + Date.now() + ".jpg";
        cb (null, file.fieldname + "-" + Date.now() + ".jpg");
    }
});

var upload = multer({storage: storage}).single("articleImage");

router.get ("/enhancement", function (req, res, next) {
    pageNum = 1;

    var stories;
    var articleTitles = [];
    var articleImages = [];
    var articleDescriptions = [];
    var articleIDs = [];
    var articleAuthors = [];
    Article.find (function (err, articles) {
        stories = articles.reverse();
        for (var i = 0; i < 16; i++) {
            articleTitles[i] = stories[i].title;
            articleImages[i] = stories[i].imagePath;
            articleDescriptions[i] = stories[i].description;
            articleAuthors[i] = stories[i].author;
            articleIDs[i] = stories[i]._id;
            if (articles.length === (i+1)) break;
        }
        if (articles.length > 16) {
            res.render ("enhancement/enhancement", {authors: articleAuthors, pagination: true, articleTitles: articleTitles, articleImages: articleImages, articleDescriptions: articleDescriptions, articleIDs: articleIDs});
        } else {
            res.render ("enhancement/enhancement", {authors: articleAuthors, pagination: false, articleTitles: articleTitles, articleImages: articleImages, articleDescriptions: articleDescriptions, articleIDs: articleIDs});
        }
    });
});

router.get ("/enhancement/:pageNumber", function (req, res, next) {
    if (req.params.pageNumber == 1 || req.params.pageNumber == 0) {
        return res.redirect ("/enhancement/enhancement");
    }
    pageNum = parseInt (req.params.pageNumber);
    var High = pageNum * 16;
    var Low = High - 16;
    var stories;
    var breakNum = false;
   Article.find (function (err, articles) {
       stories = articles.reverse();
       var articleTitles = [];
       var articleImages = [];
       var articleDescriptions = [];
       var articleIDs = [];
       var articleAuthors = [];
       for (var i = Low; i < High; i++) {
           if (!articles[i]) {
               breakNum = true;
               break;
           } else {
               articleTitles[i] = stories[i].title;
               articleImages[i] = stories[i].imagePath;
               articleDescriptions[i] = stories[i].description;
               articleAuthors[i] = stories[i].author;
               articleIDs[i] = stories[i]._id;
               if (articles.length === (i+1)) break;
           }
       }
       if (breakNum === true) {
           return res.redirect ("/enhancement/enhancement/");
       } else {
           res.render ("enhancement/enhancement", {authors: articleAuthors, pagination: true, articleTitles: articleTitles, articleImages: articleImages, articleDescriptions: articleDescriptions, articleIDs: articleIDs});
       }
   });
});

router.get ("/submit-article", isApproved, function (req, res, next) {
    res.render ("enhancement/submit-article");
});

router.get ("/submit-article-image", isApproved, function (req, res, next) {
    res.render ("enhancement/submit-article-image");
});

var articleTitle;
var articleContent;
var banned;

router.get ("/:articleID", function (req, res, next) {
    var loopID = [];

    Article.findOne ({_id :req.params.articleID}, function (err, article) {
       if (!article) {
           return res.redirect ("/");
       }
        for (var i = 0; i < article.comments.length; i++) {
            loopID[i] = req.params.articleID;
        }
       User.findOne ({username: article.author}, function (err, user) {
           if (err) {
               console.log (err);
           }
           else if (!user) {
               return res.redirect ("/");
           }
           User.findOne ({username:req.session["username"]}, function (err, currentUser) {
               if (!currentUser) {
                   return res.render ("enhancement/generic-article", {article:article, user: currentUser, articleImage: article.imagePath, replyToMessage: article.userReplyToMessage, commentReplyTo:commentReplyTo, goingToReply:reply, replyTo: replyTo, users: article.users, comments: article.comments, loopID:loopID, id: req.params.articleID, title: article.title, content: article.content, author: article.author, image: user.profilePic, replies:article.replies});
               }
               else {
                   res.render ("enhancement/generic-article", {article: article, user:currentUser, articleImage: article.imagePath, banned:currentUser.banned, replyToMessage: article.userReplyToMessage, commentReplyTo:commentReplyTo, goingToReply:reply, replyTo: replyTo, users: article.users, comments: article.comments, loopID:loopID, id: req.params.articleID, title: article.title, content: article.content, author: article.author, image: user.profilePic, replies:article.replies});
               }
           });
       });
    });
});

router.post ("/delete-article", function (req, res, next) {
   if (req.body.deleteArticle) {
       Article.findOneAndRemove ({_id:req.body.articleID}, function (err, article) {
           if (err) {
               conosle.log (err);
           }
           if (!article) {
               console.log ("Article ID: " + req.body.articleID + " doesn't exist!");
           }
       })
   }
   res.redirect ("/enhancement/" + req.body.articleID);
});

router.post ("/delete-comments", function (req, res, next) {
    if (req.body.deleteComments) {
        Article.findOneAndUpdate ({_id:req.body.articleID}, {$set: {comments: [], users: [], replies: [], userReplyToMessage: []}}, {upsert:true}, function (err, article) {
            if (err) {
                console.log(err);
            }
            if (!article) {
                console.log ("There is no article with ID: " + req.body.articleID);
            }
            else {
                console.log ("Found " + req.body.articleID);
            }
        })
    }
    res.redirect ("/enhancement/" + req.body.articleID);
});

router.post ("/disallow-comments", function (req, res, next) {
   if (req.body.disallowComments) {
       Article.findOneAndUpdate ({_id:req.body.articleID}, {$set:{allowComments: false}}, {upsert:true}, function (err, article) {
           if (err) {
               console.log(err);
           }
           if (!article) {
               console.log ("There is no article with ID: " + req.body.articleID);
           }
       })
   }
   res.redirect ("/enhancement/" + req.body.articleID);
});

router.post ("/allow-comments", function (req, res, next) {
   if (req.body.allowComments) {
       Article.findOneAndUpdate ({_id:req.body.articleID}, {$set:{allowComments:true}}, {upsert:true}, function(err, article) {
           if (err) {
               console.log(err);
           }
           if (!article) {
               console.log ("There is no article with ID: " + req.body.articleID);
           }
       })
   }
   res.redirect ("/enhancement/" + req.body.articleID);
});

router.post ("/click", function (req, res, next) {
        articleTitle = req.body.articleID;
        res.redirect ("/enhancement/" + req.body.articleID);
});

var commentQuote;

router.post ("/make-article-comment", function (req, res, next) {
    if (req.body.commentArea) {
        if (req.body.commentReplyTo) {
            commentQuote = req.body.commentReplyTo
        }
        Article.findOneAndUpdate ({_id: req.body.articleid},
            {$push: {comments: req.body.commentArea, users: req.session["username"], replies: req.body.commentReplyTo,
                userReplyToMessage:req.body.userReplyTo}},
            {upsert: true}, function (err, article) {
                if (err) {
                    console.log (err);
                }
            });
        User.findOneAndUpdate ({username: req.session["username"]},
            {$push: {articleComments: req.body.commentArea, articlesPost: req.body.articleTitle, articleid: req.body.articleid}},
            {upsert: true}, function (err, user) {
                if (err) {
                    console.log (err);
                }
            });
        reply = false;
        replyTo = null;
        commentReplyTo = null;
        commentQuote = null;
        req.session.shareCount = null;
    }

    res.redirect ("/enhancement/" + req.body.articleid + "/#bottom");
});

var reply = false;
var replyTo;
var commentReplyTo;

router.post ("/reply-to-comment", function (req, res, next) {
    replyTo = req.body.commentUser;
    commentReplyTo = req.body.commentContent;
    reply = true;
    res.redirect ("/enhancement/" + req.body.articleId + "/#bottom");
});

router.post ("/next", function (req, res, next) {
    pageNum += 1;
    res.redirect ("/enhancement/enhancement/" + pageNum);
});

router.post ("/prev", function (req, res, next) {
    pageNum -= 1;
    res.redirect ("/enhancement/enhancement/" + pageNum);
});

router.post ("/complete-article", function (req, res, next) {
    title = req.body.articleTitle;
    var article = new Article({
        title: req.body.articleTitle
    });

    article.save (function (err, article) {
        if (err) {
            console.log (err);
        }
    });

    if (req.body.disallowComments) {
        Article.findOneAndUpdate ({title:req.body.articleTitle},
            {$set: {description: req.body.articleDescription, content: req.body.articleContent, author: req.session["username"], allowComments:false}},
            {upsert: true},
            function (err, articles) {
                if (err) {
                    console.log(err);
                }
            }
        );
    } else {
        Article.findOneAndUpdate ({title:req.body.articleTitle},
            {$set: {description: req.body.articleDescription, content: req.body.articleContent, author: req.session["username"]}},
            {upsert: true},
            function (err, articles) {
                if (err) {
                    console.log(err);
                }
            }
        );
    }

    res.redirect ("/enhancement/submit-article-image");
});

router.post ("/submit-image", function (req, res, next) {
    upload (req, res, function (err) {
        if (err) {
            console.log (err);
        }
        Article.findOneAndUpdate ({title: title}, {$set: {imagePath: "/article-uploads/" + avatar}}, {upsert: true}, function (err, article) {
            if (err) {
                console.log (err);
            }
            if (!article) {
                return res.redirect ("/");
            } else {
                User.findOneAndUpdate ({username:req.session["username"]}, {$push: {articlesWritten: title, articlesWrittenid: article._id}}, {upsert: true}, function (err, user) {
                    if (err) {
                        console.log (err);
                    }
                })
            }
        });
        res.redirect ("/enhancement/enhancement");
    });
});

function isApproved (req, res, next) {
    User.findOne ({username: req.session["username"]}, function (err, user) {
        if (!user) {
            return res.redirect ("/");
        } else if (user.allowedToUploadArticles === true) {
            return next();
        } else {
            res.redirect ("/");
        }
    });
}


module.exports = router;