var express = require('express');
var csrf = require("csurf");
var router = express.Router();
var passport = require ("passport");
var User = require ("../models/user");
var Thread = require ("../models/threads");
var Article = require ("../models/article");
var Product = require ("../models/product");
var recentThreads = require ("../models/recentThreads");
var NewOrder = require ("../models/newOrders");
var Order = require ("../models/order");
var Customer = require ("../models/customers");
var Code = require ("../models/codes");

var mongoose = require ("mongoose");
var multer = require ("multer"); // middleware needed to save files and images onto disk space
var Cart = require ("../models/cart");

var avatar;

var storage = multer.diskStorage ({
  destination: function (req, file, cb) {
    cb (null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    avatar = file.fieldname + "-" + Date.now() + ".jpg";
    cb (null, file.fieldname + "-" + Date.now() + ".jpg");
  }
});

var upload = multer({storage: storage}).single("profileImage"); // profileImage is the name of the input file type on profile.hbs view

var csrfProtection = csrf ();

var comments = [];
/* GET home page. */
router.get('/', function(req, res, next) {
    var successMsg = req.flash("success")[0];
  var twoArticles;
  var articleTitles = [];
  var articleImages = [];
  var articleDescriptions = [];
  var articleAuthors = [];
  var articleIDs = [];
  Article.find (function(err, articles) {
    twoArticles = articles.reverse();
    for (var i = 0; i < 2; i++) {
      articleTitles[i] = twoArticles[i].title;
      articleImages[i] = twoArticles[i].imagePath;
      articleDescriptions[i] = twoArticles[i].description;
      articleAuthors[i] = twoArticles[i].author;
      articleIDs[i] = twoArticles[i]._id;
    }
    res.render('index', { noMessages:!successMsg, successMsg:successMsg, title: 'Pure Pantheon', articleAuthors2: articleAuthors[1], articleTitles2: articleTitles[1], articleImages2: articleImages[1], articleDescriptions2: articleDescriptions[1], articleID2: articleIDs[1], articleAuthors1: articleAuthors[0], articleTitles1: articleTitles[0], articleImages1: articleImages[0], articleDescriptions1: articleDescriptions[0], articleID1: articleIDs[0]});
  });
});

router.post ("/get-article", function (req, res, next) {
  res.redirect ("/enhancement/" + req.body.articleID);
});

// Supplement stuff

router.get ("/supplements/atlas-strength-preworkout", function (req, res, next) {
    var currentStock;

    var cart = new Cart(req.session.cart ? req.session.cart : {});

    req.session.oldUrl = req.url;
    Product.findOne({title:"ATLAS STRENGTH"}, function (err, product) {
        if (product != null) {
            if (!product.stockQuantity) {
                currentStock = 0;
            }
            else {
                currentStock = product.stockQuantity;
            }
        }

        var outMessage = req.flash("out");
        var maxMessage = req.flash("max");
        var addMessage = req.flash("add");
        var subtractMessage = req.flash("subtract");

        res.render ("supplements/atlas-strength-preworkout", {subMessage:subtractMessage, qty: cart.totalQty, description: product.description, title:product.title, picture: product.imagePath, id: product._id, addMessage:addMessage, maxMessage:maxMessage, outMessage:outMessage, available:currentStock});
    })
});

router.get ("/main/supplement", function (req, res, next) {
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    req.session.oldUrl = req.url;

    Product.find (function (err, products) {
        var outMessage = req.flash("out");
        var maxMessage = req.flash("max");
        var addMessage = req.flash("add");
        var subtractMessage = req.flash("subtract");
        var successMessage = req.flash("success");

        var qty = [];
        for (var i = 0; i < products.length; i++) {
            qty[i] = cart.totalQty;
        }
        res.render ("main/supplement", {successMsg:successMessage, subMessage:subtractMessage, qty:qty, cartExists: cart.totalQty, products:products, title: "Supplement Page", addMessage:addMessage, maxMessage: maxMessage, outMessage:outMessage, noOut:!outMessage});
    })
});

///////////////

router.get ("/logout", function (req, res, next) {
    req.session["username"] = null;
    req.session.cart = null;
    req.logout ();
    res.redirect ("/");
});

// forum stuff
/*
var specificUserDescription;
var pageName;
var id;
var user;

router.get ("/main/forum", function (req, res, next) {
  Thread.find (function (err, threads) {
    User.findOne ({username:req.session["username"]}, function (err, user) {
      if(!user) {
        return res.render ("main/forum", {title: "Threads", threads:threads.reverse()})
      }
      res.render ("main/forum", {admin:user.admin, banned:user.banned, title: "Threads", threads:threads.reverse()});
    });
  });
});

router.get ("/main/forum/recent-reply", function (req, res, next) {
  recentThreads.find(function (err, threads) {
    User.findOne ({username:req.session["username"]}, function (err, user) {
      if(!user) {
        return res.render ("main/forum", {title: "Threads", recentThreads:threads.reverse()})
      }
      res.render ("main/forum", {admin:user.admin, banned:user.banned, title: "Threads", recentThreads:threads.reverse()});
    });
  })

});

router.get ("/forum/forum-read/:id", function (req, res, next) {
  var getUsers = [];
  var getPics = [];
  var forumComments = [];
  var counter = 0;
  var loopID = [];
  var userReplyToMessage = [];
  var loopPageNum = [];
  var numPages;
  var numPagesArray = [];
  var pageID = [];

  Thread.findOne ({_id:req.params.id}, function (err, thread) {
    if (!thread) {
      res.redirect ("/main/forum");
    } else {
      for (var i = 0; i < 5; i++) {
        pageID [i] = req.params.id;
      }
      for (var i = 0; i < 25; i++) {
        if (thread.users.length === i) break;
        getUsers[i] = thread.users[i];
        loopPageNum[i] = 1;
      }
      for (var i = 0; i < 25; i++) {
        if (thread.comments.length === i) break;
        forumComments [i] = thread.comments[i];
        userReplyToMessage[i] = thread.userReplyToMessage[i];
        loopID[i] = req.params.id;
      }
      numPages = Math.ceil (thread.comments.length / 25)
      if (numPages <= 3) {
        for (var i = 2; i <= numPages; i++) {
          numPagesArray[i-1] = i;
        }
      } else {
        for (var i = 2; i <= 3; i++) {
          numPagesArray[i-1] = i;
        }
      }

      User.findOne ({username:req.session["username"]}, function (err, user) {
        if (!user) {
          return res.render("forum/forum-read", {pageID: pageID, currentPage:1, nextPages: numPagesArray, page:loopPageNum, pageNum: 1, postNum: (thread.comments.length), replies:thread.replies, replyToMessage: userReplyToMessage, commentReplyTo:commentReplyTo, replyTo:replyTo, goingToReply:reply, loopID:loopID, descriptions: thread.descriptions, users: getUsers, comment: forumComments, id: req.params.id, pageName: thread.threadName, pics: thread.profilePics});
        } else if (user.banned) {
          return res.redirect ("/user/banned");
        } else if (!thread) {
          return res.redirect ("/");
        } else {

          res.render("forum/forum-read", {user:user, pageID: pageID, currentPage:1, nextPages: numPagesArray, page:loopPageNum, pageNum: 1, postNum: (thread.comments.length), replies:thread.replies, replyToMessage: userReplyToMessage, commentReplyTo:commentReplyTo, replyTo:replyTo, goingToReply:reply, loopID:loopID, descriptions: thread.descriptions, users: getUsers, comment: forumComments, id: req.params.id, pageName: thread.threadName, pics: thread.profilePics});
          reply = false;
          replyTo = null;
          commentReplyTo = null;
        }
      })
    }
  });
});

router.get ("/forum/forum-read/:id/:pageNum", function (req, res, next) {
  var pageNum = parseInt(req.params.pageNum);
  var largePost = pageNum * 25;
  var smallPost = largePost - 25;
  var currentPage = parseInt(req.params.pageNum, 10);
  var numPages;
  var nextPageArray = [];
  var prevPageArray = [];
  var pageID = [];
  Thread.findOne ({_id:req.params.id}, function(err, thread) {
    if (!thread) {
      res.redirect ("/main/forum");
    } else {
      for (var i = 0; i < 5; i++) {
        pageID [i] = req.params.id;
      }
      if (thread.comments.length < smallPost) {
        res.redirect ("/forum/forum-read/" + req.params.id);
      } else {
        numPages = Math.ceil(thread.comments.length / 25);
        if ((numPages - currentPage) >= 2) {
          nextPageArray [0] = (currentPage + 1);
          nextPageArray [1] = (currentPage + 2);
        } else if (numPages - currentPage === 1) {
          nextPageArray [0] = (currentPage + 1);
        } else{}

        if (currentPage === 1) {
        } else if (currentPage === 2) {
          prevPageArray [0] = 1;
        } else {
          prevPageArray [0] = (currentPage - 1);
          prevPageArray [1] = (currentPage - 2);
        }
        var getUsers = [];
        var getPics = [];
        var forumComments = [];
        var counter = 0;
        var loopID = [];
        var loopPageNum = [];
        var userReplyToMessage = [];
        for (var i = smallPost; i < largePost; i++) {
          if (thread.users.length === i) break;
          getUsers[i] = thread.users[i];
        }
        for (var i = smallPost; i < largePost; i++) {
          if (thread.comments.length === i) break;
          forumComments [i] = thread.comments[i];
          loopID[i] = req.params.id;
          loopPageNum[i] = req.params.pageNum;
          userReplyToMessage[i] = thread.userReplyToMessage[i];
        }
        User.findOne ({username:req.session["username"]}, function (err, user) {
          if (!user) {
            return res.render("forum/forum-read", {pageID:pageID, currentPage:currentPage, prevPages:prevPageArray.reverse(), nextPages:nextPageArray, pageNum:req.params.pageNum, postNum: (thread.comments.length), page:loopPageNum, replies:thread.replies, replyToMessage: userReplyToMessage, commentReplyTo:commentReplyTo, replyTo:replyTo, goingToReply:reply, loopID:loopID, descriptions: thread.descriptions, users: getUsers, comment: forumComments, id: req.params.id, pageName: thread.threadName, pics: thread.profilePics});
          } else if (user.banned) {
            return res.redirect ("/user/banned");
          } else if (!thread) {
            return res.redirect ("/");
          } else {

            res.render("forum/forum-read", {user:user, pageID:pageID, currentPage:currentPage, prevPages:prevPageArray.reverse(), nextPages:nextPageArray, pageNum:req.params.pageNum, postNum: (thread.comments.length), page:loopPageNum, replies:thread.replies, replyToMessage: userReplyToMessage, commentReplyTo:commentReplyTo, replyTo:replyTo, goingToReply:reply, loopID:loopID, descriptions: thread.descriptions, users: getUsers, comment: forumComments, id: req.params.id, pageName: thread.threadName, pics: thread.profilePics});
            reply = false;
            replyTo = null;
            commentReplyTo = null;
          }
        })
      }
    }
  })
});

router.get ("/forum/create-thread", function (req, res, next) {
    var threadMsg = req.flash("threadNotComplete");
    var noMsg = req.flash ("noFind");
    res.render ("forum/create-thread", {threadMsg: threadMsg});
});

router.post ("/forum/create-thread", function (req, res, next) {
   if (req.body.threadTitle && req.body.threadContent) {
       var threadID;
       var newThread = new Thread ({
           threadName: req.body.threadTitle
       });
       newThread.save (function (err, thread) {
           if (err) {
               console.log(err);
           } else {
               threadID = thread._id;
               Thread.findOneAndUpdate ({_id:threadID}, {$push:{comments: req.body.threadContent, users:req.session["username"], replies:"", userReplyToMessage:""}}, {upsert:true}, function (err, thread) {
                   if (err) {
                       console.log (err);
                   }
                   if (!thread) {
                       console.log ("There is no thread with id " + threadID);
                       req.flash ("noFind", "Couldn't find thread with id " + threadID);
                       return res.redirect ("/forum/create-thread");
                   }
                   User.findOneAndUpdate ({username:req.session["username"]}, {$push:{postNum:0, pageNum:1, threadsPost:thread.threadName,
                   comments:req.body.threadContent, threadid:threadID}}, {upsert:true}, function (err, user) {
                      if (err) {
                          console.log (err);
                      }
                      if (!user) {
                          console.log ("Couldn't find user: " + req.session["username"]);
                      } else {
                          Thread.findOneAndUpdate ({_id:threadID}, {$push:{descriptions:user.description, profilePics:user.profilePic}}, {upsert:true}, function (err, thread) {
                              if (err) {
                                  console.log (err);
                              }
                              return res.redirect ("/forum/forum-read/" + threadID);
                          })
                      }
                   });
               });
           }
       });

   } else {
       req.flash ("threadNotComplete", "You must have both a thread title and thread content inputted to create a new thread");
       return res.redirect ("/forum/create-thread");
   }
});

router.post ("/delete/thread", function (req, res, next) {
  if (req.body.deleteThread) {
    Thread.remove ({_id:req.body.threadID}, function (err, thread) {});
    recentThreads.remove ({threadID:req.body.threadID}, function (err, thread) {});
  }
  res.redirect ("/main/forum");
});

router.post ("/forum/forum-read/submit", function (req, res, next) {
  var userPageNum;

  var pic;
  pageName = req.body.threadName;
  id = req.body.threadid;

  var pageNum;
  var directToPageNum;

    if (req.body.commentArea) {
        recentThreads.remove({threadID:id}, function(err, thread) {
            if (err) {
                console.log (err);
            }
        });

        var thread =  new recentThreads ({
            threadName:pageName,
            threadID: id
        });

        thread.save(function (err) {
            if (err) {
                console.log (err);
            }
        });

        Thread.findOne ({_id:id}, function (err, thread) {
            userPageNum = Math.ceil ((thread.comments.length + 1) / 25);
            User.findOneAndUpdate ({username:req.session["username"]}, {$push: {pageNum: userPageNum}}, {upsert:true}, function (err, user) {
            })
        });

        User.findOne ({username: req.session["username"]}, function (err, user) {
            specificUserDescription = user.description;
            pic = user.profilePic;
            Thread.findOneAndUpdate ({_id: id}, {$push: {descriptions: specificUserDescription, profilePics: pic}}, {upsert: true}, function (err, thread){
            });
            console.log (user);
        });

        User.update ({"username": req.session["username"]}, {$push:
        {comments: req.body.commentArea, threadsPost: pageName, threadid: id, postNum: req.body.postNum}}, {upsert:true}, function (err, doc) {
            if (err) {
                console.log ("Something went wrong obviously");
            }
            console.log(doc);
        });

        Thread.update ({"_id": id}, {$push: {comments: req.body.commentArea, users: req.session["username"],
            replies: req.body.commentReplyTo, userReplyToMessage: req.body.userReplyTo}}, {upsert:true}, function (err, thread) {
            if (err) {
                console.log ("Something went wrong");
            }
        });

        Thread.findOne ({_id:id}, function (err, thread) {
            if ((thread.comments.length / 25)+1 % 1 === 0) {
                pageNum = Math.ceil((thread.comments.length / 25) + 1);
            } else {
                pageNum = Math.ceil((thread.comments.length / 25));
            }
            recentThreads.findOneAndUpdate ({threadID:id}, {$set: {comments:thread.comments.length}}, {upsert: true}, function (err) {
                if (err) {
                    console.log (err);
                }
            });
            if (pageNum === 1) {
                res.redirect ("/forum/forum-read/" + id + "/#" + req.body.postNum);
            } else {
                res.redirect ("/forum/forum-read/" + id + "/" + pageNum + "/#" + req.body.postNum);
            }
        });
    } else {

    }

});

var reply;
var replyTo;
var commentReplyTo;

router.post ("/forum/reply-to-comment", function (req, res, next) {
  reply = true;
  replyTo = req.body.commentUser;
  commentReplyTo = req.body.commentContent;
  res.redirect ("/forum/forum-read/" + req.body.threadId + "/" + req.body.pageNum + "/#bottom");
});

router.post ("/main/forum", function (req, res, next) {
  var newThread = new Thread ();
  newThread.threadName = req.body.title;
  newThread.save (function (err, docs) {
    if (err) {
      console.log ("Something's off brah");
    } else {
      console.log (docs);
    }
    id = docs._id;
    res.redirect ("/forum/forum-read/" + id);
  });
});

router.post ("/jump-to-page", function (req ,res, next) {
  var goTo = parseInt(req.body.jumpToPage);
  Thread.findOne ({_id:req.body.threadID}, function (err, thread) {
    var numOfPages = Math.ceil (thread.comments.length / 25);
    if (isNaN(goTo)) {
      res.redirect ("/forum/forum-read/" + req.body.threadID);
    } else {
      if (goTo > numOfPages) {
        goTo = numOfPages;
      } else if (goTo < 1) {
        goTo = 1;
      } else {}
      res.redirect ("/forum/forum-read/" + req.body.threadID + "/" + goTo);
    }
  })
});
*/

// User stuff
router.get ("/user/banned", isBanned, function(req, res, next) {
  res.render ("user/banned");
});

router.get ("/user/profile/:username", function (req, res, next) {
  User.findOne ({"username": req.params.username}, function (err, docs) {
    if (err) {
      console.log ("There's been a terrible mistake");
    } else if (!docs) {
      return res.redirect ("/");
    } else {
      var firstComments = [];
      var comments = docs.comments.reverse();
      var greetingMessage;
      var greaterThanTwentyFive;
      if (docs.comments.length > 25) {
          greaterThanTwentyFive = true;
          for (var i = 0; i < 25; i++) {
              firstComments[i] = comments[i];
          }
      }  else {
          greaterThanTwentyFive = false;
      }
      if (req.session["username"] === req.params.username) {
          greetingMessage = "Welcome to your profile " + req.session["username"];
          if (req.session["username"] === "VladimirMassive") {
              res.render ("user/profile", {firstComments:firstComments, showMoreComments: greaterThanTwentyFive, newOrders:true, postNum: docs.postNum.reverse(), pageNum:docs.pageNum.reverse(), writeArticle: docs.allowedToUploadArticles, forum: true, description: docs.description, profilePic: docs.profilePic, belongs: true, message: greetingMessage, user: docs, username: req.session["username"], ids: docs.threadid.reverse(), threads: docs.threadsPost.reverse(), comments: comments, allowedToUpload: docs.allowedToUploadArticles});
          } else {
              res.render ("user/profile", {firstComments:firstComments, showMoreComments: greaterThanTwentyFive, postNum: docs.postNum.reverse(), pageNum:docs.pageNum.reverse(), writeArticle: docs.allowedToUploadArticles, forum: true, description: docs.description, profilePic: docs.profilePic, belongs: true, message: greetingMessage, user: docs, username: req.session["username"], ids: docs.threadid.reverse(), threads: docs.threadsPost.reverse(), comments: comments, allowedToUpload: docs.allowedToUploadArticles});
          }
      } else {
        greetingMessage = "You are now visiting " + req.params.username + "'s profile";
        if (req.session["username"] === "VladimirMassive") {
          if (docs.allowedToUploadArticles === true) {
            res.render ("user/profile", {firstComments:firstComments, showMoreComments: greaterThanTwentyFive, postNum: docs.postNum.reverse(), pageNum:docs.pageNum.reverse(), banned:docs.banned, writeArticle: docs.allowedToUploadArticles, forum: true, take: true, admin: true, description: docs.description, profilePic: docs.profilePic, message: greetingMessage, user: docs, username: req.params.username, ids: docs.threadid.reverse(), threads: docs.threadsPost.reverse(), comments: comments});
          } else {
            res.render ("user/profile", {firstComments:firstComments, showMoreComments: greaterThanTwentyFive, postNum: docs.postNum.reverse(), pageNum:docs.pageNum.reverse(), banned:docs.banned, writeArticle: docs.allowedToUploadArticles, forum: true, admin: true, description: docs.description, profilePic: docs.profilePic, message: greetingMessage, user: docs, username: req.params.username, ids: docs.threadid.reverse(), threads: docs.threadsPost.reverse(), comments:comments});
          }
        } else {
          res.render ("user/profile", {firstComments:firstComments, showMoreComments: greaterThanTwentyFive, postNum: docs.postNum.reverse(), pageNum:docs.pageNum.reverse(), writeArticle: docs.allowedToUploadArticles, forum: true, description: docs.description, profilePic: docs.profilePic, message: greetingMessage, user: docs, username: req.params.username, ids: docs.threadid.reverse(), threads: docs.threadsPost.reverse(), comments:comments});
        }
      }
    }
  });
});

router.get ("/user/profile/:username/show-all-comments", function (req, res, next) {
    User.findOne ({"username": req.params.username}, function (err, docs) {
        if (err) {
            console.log ("There's been a terrible mistake");
        } else if (!docs) {
            return res.redirect ("/");
        } else {
            var firstComments = [];
            var comments = docs.comments.reverse();
            var greetingMessage;
            var greaterThanTwentyFive = false;
            var showLess;
            if (docs.comments.length > 25) {
                showLess = true;
            } else {
                showLess = false;
            }
            if (req.session["username"] === req.params.username) {
                greetingMessage = "Welcome to your profile " + req.session["username"];
                if (req.session["username"] === "VladimirMassive") {
                    res.render ("user/profile", {showLess: showLess, showMoreComments: greaterThanTwentyFive, newOrders:true, postNum: docs.postNum.reverse(), pageNum:docs.pageNum.reverse(), writeArticle: docs.allowedToUploadArticles, forum: true, description: docs.description, profilePic: docs.profilePic, belongs: true, message: greetingMessage, user: docs, username: req.session["username"], ids: docs.threadid.reverse(), threads: docs.threadsPost.reverse(), comments: comments, allowedToUpload: docs.allowedToUploadArticles});
                } else {
                    res.render ("user/profile", {showLess: showLess, showMoreComments: greaterThanTwentyFive, postNum: docs.postNum.reverse(), pageNum:docs.pageNum.reverse(), writeArticle: docs.allowedToUploadArticles, forum: true, description: docs.description, profilePic: docs.profilePic, belongs: true, message: greetingMessage, user: docs, username: req.session["username"], ids: docs.threadid.reverse(), threads: docs.threadsPost.reverse(), comments: comments, allowedToUpload: docs.allowedToUploadArticles});
                }
            } else {
                greetingMessage = "You are now visiting " + req.params.username + "'s profile";
                if (req.session["username"] === "VladimirMassive") {
                    if (docs.allowedToUploadArticles === true) {
                        res.render ("user/profile", {showLess: showLess, showMoreComments: greaterThanTwentyFive, postNum: docs.postNum.reverse(), pageNum:docs.pageNum.reverse(), banned:docs.banned, writeArticle: docs.allowedToUploadArticles, forum: true, take: true, admin: true, description: docs.description, profilePic: docs.profilePic, message: greetingMessage, user: docs, username: req.params.username, ids: docs.threadid.reverse(), threads: docs.threadsPost.reverse(), comments: comments});
                    } else {
                        res.render ("user/profile", {showLess: showLess, showMoreComments: greaterThanTwentyFive, postNum: docs.postNum.reverse(), pageNum:docs.pageNum.reverse(), banned:docs.banned, writeArticle: docs.allowedToUploadArticles, forum: true, admin: true, description: docs.description, profilePic: docs.profilePic, message: greetingMessage, user: docs, username: req.params.username, ids: docs.threadid.reverse(), threads: docs.threadsPost.reverse(), comments:comments});
                    }
                } else {
                    res.render ("user/profile", {showLess: showLess, showMoreComments: greaterThanTwentyFive, postNum: docs.postNum.reverse(), pageNum:docs.pageNum.reverse(), writeArticle: docs.allowedToUploadArticles, forum: true, description: docs.description, profilePic: docs.profilePic, message: greetingMessage, user: docs, username: req.params.username, ids: docs.threadid.reverse(), threads: docs.threadsPost.reverse(), comments:comments});
                }
            }
        }
    });
});

router.get ("/user/profile/article-comments/:username", function (req, res, next) {
  User.findOne ({"username": req.params.username}, function (err, docs) {
    if (err) {
      console.log ("There's been a terrible mistake");
    } else if (!docs) {
      return res.redirect ("/");
    } else {
        var greetingMessage;
        var firstComments = [];
        var comments = docs.articleComments.reverse();
        var greaterThanTwentyFive;
        if (docs.articleComments.length > 25) {
            greaterThanTwentyFive = true;
            for (var i = 0; i < 25; i++) {
                firstComments[i] = comments[i];
            }
        }  else {
            greaterThanTwentyFive = false;
        }

      if (req.session["username"] === req.params.username) {
        greetingMessage = "Welcome to your profile " + req.session["username"];
        res.render ("user/profile", {firstComments:firstComments, showMoreComments: greaterThanTwentyFive, aComments: true, writeArticle: docs.allowedToUploadArticles, comments: docs.articleComments.reverse(), ids: docs.articleid.reverse(), threads: docs.articlesPost.reverse(), description: docs.description, profilePic: docs.profilePic, belongs: true, message: greetingMessage, user: docs, username: req.session["username"], allowedToUpload: docs.allowedToUploadArticles});
      } else {
        greetingMessage = "You are now visiting " + req.params.username + "'s profile";
        if (req.session["username"] === "VladimirMassive") {
          if (docs.allowedToUploadArticles === true) {
            res.render ("user/profile", {firstComments:firstComments, showMoreComments: greaterThanTwentyFive, aComments: true, writeArticle: docs.allowedToUploadArticles, comments: docs.articleComments.reverse(), ids: docs.articleid.reverse(), threads: docs.articlesPost.reverse(), take: true, admin: true, description: docs.description, profilePic: docs.profilePic, message: greetingMessage, user: docs, username: req.params.username});
          } else {
            res.render ("user/profile", {firstComments:firstComments, showMoreComments: greaterThanTwentyFive, aComments: true, writeArticle: docs.allowedToUploadArticles, comments: docs.articleComments.reverse(), ids: docs.articleid.reverse(), threads: docs.articlesPost.reverse(), admin: true, description: docs.description, profilePic: docs.profilePic, message: greetingMessage, user: docs, username: req.params.username});
          }
        } else {
          res.render ("user/profile", {firstComments:firstComments, showMoreComments: greaterThanTwentyFive, aComments: true, writeArticle: docs.allowedToUploadArticles, comments: docs.articleComments.reverse(), ids: docs.articleid.reverse(), threads: docs.articlesPost.reverse(), description: docs.description, profilePic: docs.profilePic, message: greetingMessage, user: docs, username: req.params.username});
        }
      }
    }
  });
});

router.get ("/user/profile/article-comments/:username/show-all-comments", function (req, res, next) {
    User.findOne ({"username": req.params.username}, function (err, docs) {
        if (err) {
            console.log ("There's been a terrible mistake");
        } else if (!docs) {
            return res.redirect ("/");
        } else {
            var greetingMessage;
            var firstComments = [];
            var comments = docs.articleComments.reverse();
            var greaterThanTwentyFive = false;
            var showLess;
            if (docs.articleComments.length > 25) {
                showLess = true;
            }  else {
                showLess = false;
            }

            if (req.session["username"] === req.params.username) {
                greetingMessage = "Welcome to your profile " + req.session["username"];
                res.render ("user/profile", {showLess:showLess, firstComments:firstComments, showMoreComments: greaterThanTwentyFive, aComments: true, writeArticle: docs.allowedToUploadArticles, comments: comments, ids: docs.articleid.reverse(), threads: docs.articlesPost.reverse(), description: docs.description, profilePic: docs.profilePic, belongs: true, message: greetingMessage, user: docs, username: req.session["username"], allowedToUpload: docs.allowedToUploadArticles});
            } else {
                greetingMessage = "You are now visiting " + req.params.username + "'s profile";
                if (req.session["username"] === "VladimirMassive") {
                    if (docs.allowedToUploadArticles === true) {
                        res.render ("user/profile", {showLess:showLess, firstComments:firstComments, showMoreComments: greaterThanTwentyFive, aComments: true, writeArticle: docs.allowedToUploadArticles, comments: comments, ids: docs.articleid.reverse(), threads: docs.articlesPost.reverse(), take: true, admin: true, description: docs.description, profilePic: docs.profilePic, message: greetingMessage, user: docs, username: req.params.username});
                    } else {
                        res.render ("user/profile", {showLess:showLess, firstComments:firstComments, showMoreComments: greaterThanTwentyFive, aComments: true, writeArticle: docs.allowedToUploadArticles, comments: comments, ids: docs.articleid.reverse(), threads: docs.articlesPost.reverse(), admin: true, description: docs.description, profilePic: docs.profilePic, message: greetingMessage, user: docs, username: req.params.username});
                    }
                } else {
                    res.render ("user/profile", {showLess:showLess, firstComments:firstComments, showMoreComments: greaterThanTwentyFive, aComments: true, writeArticle: docs.allowedToUploadArticles, comments: comments, ids: docs.articleid.reverse(), threads: docs.articlesPost.reverse(), description: docs.description, profilePic: docs.profilePic, message: greetingMessage, user: docs, username: req.params.username});
                }
            }
        }
    });
});

router.get ("/user/profile/articles-written/:username", function (req, res, next) {
  User.findOne ({"username": req.params.username}, function (err, docs) {
    if (err) {
      console.log ("There's been a terrible mistake");
    } else if (!docs) {
      return res.redirect ("/");
    } else {
      var greetingMessage;

      if (req.session["username"] === req.params.username) {
        greetingMessage = "Welcome to your profile " + req.session["username"];
        res.render ("user/profile", {aWrite: true, writeArticle: docs.allowedToUploadArticles, ids: docs.articlesWrittenid.reverse(), articles: docs.articlesWritten.reverse(), description: docs.description, profilePic: docs.profilePic, belongs: true, message: greetingMessage, user: docs, username: req.session["username"], allowedToUpload: docs.allowedToUploadArticles});
      } else {
        greetingMessage = "You are now visiting " + req.params.username + "'s profile";
        if (req.session["username"] === "VladimirMassive") {
          if (docs.allowedToUploadArticles === true) {
            res.render ("user/profile", {aWrite: true, writeArticle: docs.allowedToUploadArticles, ids: docs.articlesWrittenid.reverse(), articles: docs.articlesWritten.reverse(), take: true, admin: true, description: docs.description, profilePic: docs.profilePic, message: greetingMessage, user: docs, username: req.params.username});
          } else {
            res.render ("user/profile", {aWrite: true, writeArticle: docs.allowedToUploadArticles, ids: docs.articlesWrittenid.reverse(), articles: docs.articlesWritten.reverse(), admin: true, description: docs.description, profilePic: docs.profilePic, message: greetingMessage, user: docs, username: req.params.username});
          }
        } else {
          res.render ("user/profile", {aWrite: true, writeArticle: docs.allowedToUploadArticles, ids: docs.articlesWrittenid.reverse(), articles: docs.articlesWritten.reverse(), description: docs.description, profilePic: docs.profilePic, message: greetingMessage, user: docs, username: req.params.username});
        }
      }
    }
  });
});

router.post ("/user/click-profile-article", function (req, res, next) {
    var user = req.body.username;
    res.redirect ("/user/profile/article-comments/" + user);
});

router.post ("/user/click-profile", function(req, res, next) {
    var user = req.body.username;
    res.redirect ("/user/profile/" + user);
});

router.post("/user/my-profile", function (req, res, next) {
    res.redirect ("/user/profile/" + req.session["username"]);
});

router.post ("/user/edit-description", function (req, res, next) {
  User.update ({username:req.session["username"]}, {$set:{description:req.body.description, enable:false}}, {upsert:true}, function (err, user) {
    if (err) {
      return console.log ("Error on the /user/edit-description action");
    }
    console.log (user);
  });
  res.redirect ("/user/profile/" + req.session["username"])
});

router.post ("/user/enable-editing", function (req, res, next) {
  User.update ({username:req.session["username"]}, {$set:{enable: true}}, {upsert: true}, function (err, user) {
    if (err) {
      return console.log ("Error on the /user/edit-description action");
    }
    console.log (user);
  });
  res.redirect ("/user/profile/" + req.session["username"]);
});

router.post ("/user/upload-profile-pic", function (req, res, next) {
  upload (req, res, function (err) {
    if (err) {
      console.log (err);
    }
    User.findOneAndUpdate ({username: req.session["username"]}, {$set: {profilePic: "/uploads/" + avatar}}, {upsert: true}, function (err, user) {
      if (err) {}
    });
  });

  res.redirect ("/user/profile/" + req.session["username"]);
});

router.post ("/user/banUser", function (req, res, next) {
  if (req.body.banUser) {
    User.findOneAndUpdate ({username: req.body.getUsername}, {$set: {banned: true}}, {upsert: true}, function (err, user) {
      if (err) {
        console.log (err);
      }
    })
  }
  res.redirect ("/user/profile/" + req.body.getUsername);
});

router.post ("/user/unbanUser", function (req, res, next) {
  if (req.body.unbanUser) {
    User.findOneAndUpdate ({username: req.body.getUsername}, {$set: {banned: false}}, {upsert: true}, function (err, user) {
      if (err) {
        console.log (err);
      }
    })
  }
  res.redirect ("/user/profile/" + req.body.getUsername);
});

router.post ("/user/givePermission", function (req, res, next) {
  if (req.body.givePermission) { // Instead of messing with the .checked crap just check to see if the checkbox is there, it will return as there if the box is checked
    User.findOneAndUpdate ({username: req.body.getUsername}, {$set: {allowedToUploadArticles: true}}, {upsert: true}, function (err, user) {
      if (err) {
        console.log (err);
      }
    })
  }
  res.redirect ("/user/profile/" + req.body.getUsername);
});

router.post ("/user/takePermission", function (req, res, next) {
  if (req.body.takePermission) { // Instead of messing with the .checked crap just check to see if the checkbox is there, it will return as there if the box is checked
    User.findOneAndUpdate ({username: req.body.getUsername}, {$set: {allowedToUploadArticles: false}}, {upsert: true}, function (err, user) {
      if (err) {
        console.log (err);
      }
    })
  }
  res.redirect ("/user/profile/" + req.body.getUsername);
});

router.post ("/user/submit-article", function (req, res, next) {
  res.redirect ("/enhancement/submit-article");
});

router.get ("/user/sign-up", csrfProtection, function (req, res, next) {
  var messages = req.flash ("error");
  res.render ("user/sign-up", {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post ("/user/sign-up", passport.authenticate ("local.signup", {
  failureRedirect: "/user/sign-up",
  failureFlash: true
}), function (req, res, next) {
  if (req.session["username"] === "VladimirMassive") {
    User.findOneAndUpdate ({username: "VladimirMassive"}, {$set: {allowedToUploadArticles: true, admin: true}}, {upsert:true}, function (err, user) {
      if (err) {
        console.log (err);
      }
    })
  }
  res.redirect ("/user/profile/" + req.session["username"]);
});

router.get ("/user/sign-in", csrfProtection, function (req, res, next) {
  var messages = req.flash ("error");
  res.render ("user/sign-in", {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post ("/user/sign-in", passport.authenticate ("local.signin", {
  failureRedirect: "/user/sign-in",
  failureFlash: true
  }), function (req, res, next) { // if this function gets called, authentication was successful
  res.redirect ("/user/profile/" + req.session ["username"]);
});

// Shopping Cart
router.post ("/checkout", function (req, res, next) {
    res.redirect ("/shopping-cart/checkout");
});

router.get ("/main/shopping-cart", function (req, res, next) {
    if (!req.session.cart) {
      return res.render ("main/shopping-cart", {products: null});
    }
    var cart = new Cart (req.session.cart);
    var totalPrice;
    if (req.session.usedPromoCode) {
        totalPrice = req.session.oldPrice;
    } else {
        totalPrice = cart.totalPrice.toFixed(2)
    }
    var errMsg = req.flash("error")[0];
    var productIDs = [];
    Product.find (function (err, products) {
       for (var i = 0; i < products.length; i++) {
           productIDs [i] = products[i]._id;
       }
    });
    res.render ("main/shopping-cart", {productIDs: productIDs, products:cart.generateArray(), totalPrice:totalPrice, errMsg:errMsg, noError: !errMsg});
    req.session.oldUrl = req.url;
    req.flash ("subtract", null);
    req.flash ("add", null);
});

router.get ("/shopping-cart/checkout", function (req, res, next) {
    if (!req.session.cart) {
        return res.render ("main/shopping-cart", {products: null});
    }
    var cart = new Cart (req.session.cart);
    var shippingPrice = cart.totalPrice + 7;
    shippingPrice = Math.ceil (shippingPrice * 100)/100;
    var errMsg = req.flash("error")[0];
    var productIDs = [];
    var ids = [];
    var productID;
    var noCodeMsg = req.flash ("noCode");
    var noMoreUseMsg = req.flash ("alreadyUsed");
    var noEnterMsg = req.flash("noEnter");
    var notUsMsg = req.flash ("notUS");
    Product.find (function (err, products) {
        for (var i = 0; i < products.length; i++) {
            productIDs [i] = products[i];
            ids [i] = products[i]._id;
        }
        productID = productIDs [0];
        res.render ("main/shopping-cart", {notUS: notUsMsg, usedCode:req.session.usedPromoCode, noEnter:noEnterMsg, noCode: noCodeMsg, noMore:noMoreUseMsg, productIDs: ids, productID:req.body.productID, checkout: true, products:cart.generateArray(), chargePrice:shippingPrice * 100, shippingPrice:shippingPrice, errMsg:errMsg, noError: !errMsg});
    });
    req.session.oldUrl = req.url;
    req.flash ("subtract", null);
    req.flash ("add", null);
});

router.get ("/reduce/:id", function (req, res, next) {
    var productID = req.params.id;
    var cart = new Cart (req.session.cart ? req.session.cart: {});
    var currentStock;

    Product.findById(productID, function (err, product) {
        if (product != null) {
            if (!product.stockQuantity) {
                currentStock = 0;
            }
            else {
                currentStock = product.stockQuantity;
            }
        }
        Product.findOneAndUpdate ({_id:productID}, {$set: {stockQuantity: currentStock + 1}}, {upsert:true}, function (err, product) {});
    });

    cart.reduceByOne (productID);
    req.session.cart = cart;
    res.redirect ("/main/shopping-cart");
});

router.get ("/remove/:id", function (req, res, next) {
    var productID = req.params.id;
    var cart = new Cart (req.session.cart ? req.session.cart: {});
    var add = cart.totalQty;
    var currentStock;

    Product.findById(productID, function (err, product) {
        if (product != null) {
            if (!product.stockQuantity) {
                currentStock = 0;
            }
            else {
                currentStock = product.stockQuantity;
            }
        }
        Product.findOneAndUpdate ({_id:productID}, {$set: {stockQuantity: currentStock + add}}, {upsert:true}, function (err, product) {});
    });

    cart.removeItem (productID);
    req.session.cart = cart;
    res.redirect ("/main/shopping-cart");
});

router.post ("/quick-add-to-cart/:id", function (req, res, next) {
    res.redirect ("/add-to-cart/" + req.params.id);
});

router.post ("/quick-delete-from-cart/:id", function (req, res, next) {
    var productID = req.params.id;
    var cart = new Cart (req.session.cart ? req.session.cart : {});
    var url = req.session.oldUrl;

    Product.findById (productID, function (err, product) {
        if (err) {
            res.redirect (url);
        }
        else {
            req.flash ("subtract", "You took 1: " + product.title +  " from your cart");
            if (req.session.usedPromoCode) {
                cart.totalPrice = req.session.oldPrice;
                req.session.oldPrice = null;
                req.session.usedPromoCode = false;
            }
            cart.reduceByOne (product.id);
            req.session.cart = cart;
            console.log (req.session.cart);
            res.redirect (req.session.oldUrl);
            req.session.oldUrl = null;
        }
    })
});

router.get ("/add-to-cart/:id", function (req, res, next) {
    var productID = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    var currentStock;
    var numAdded = cart.totalQty;
    var url;

  Product.findById (productID, function (err, product) {
      if (product != null) {
          if (!product.stockQuantity) {
              currentStock = 0;
          }
          else {
              currentStock = product.stockQuantity;
          }
      }

      if (currentStock === 0 || cart.totalQty === product.stockQuantity) {
          req.flash ("out", "Uh-Oh! Looks like we're now out of that item!");
          url = req.session.oldUrl;
          req.session.oldUrl = null;
          return res.redirect (url);
      } else if (cart.totalQty === 7) {
          req.flash ("max", "Unfortunately we have a limit of only 7 products per purchase! Sorry for any inconvenience!");
          url = req.session.oldUrl;
          req.session.oldUrl = null;
          return res.redirect (url);
      } else {
          //Product.findOneAndUpdate ({_id:productID}, {$set: {stockQuantity: currentStock - 1}}, {upsert:true}, function (err, product) {});
          if (err) {return res.redirect ("/")}
          if (product.stockQuantity === 0) {
              url = req.session.oldUrl;
              req.session.oldUrl = null;
              return res.redirect (req.session.oldUrl);
          }
          if (req.session.usedPromoCode) {
              cart.totalPrice = req.session.oldPrice;
              req.session.oldPrice = null;
              req.session.usedPromoCode = false;
          }
          req.flash ("add", "You added 1: " + product.title + " to your cart!");
          cart.add (product, product.id);
          req.session.cart = cart;
          console.log (req.session.cart);
          res.redirect (req.session.oldUrl);
          req.session.oldUrl = null;
      }
  })
});

router.post ("/charge/promo-code", function (req, res, next) {
    if (req.body.promoCode) {
        Code.findOne({code: req.body.promoCode}, function (err, code) {
            if (err) {
                console.log(err);
            }
            if (!code) {
                req.flash("noCode", "Sorry! That code isn't valid!");
            }
            else {
                if (req.session.usedPromoCode === true) {
                    req.flash ("alreadyUsed", "Sorry, you cannot use more than one promo code per purchase!");
                    return res.redirect ("/shopping-cart/checkout");
                }
                var promoCode = req.body.promoCode;
                var convertToNum = promoCode.slice (-2, promoCode.length);
                var percentDiscount = Number(convertToNum);
                var cart = new Cart (req.session.cart);
                var newPercent = 100 - percentDiscount;
                req.session.oldPrice = cart.totalPrice;
                cart.totalPrice = (newPercent * cart.totalPrice) / 100;
                req.session.cart = cart;
                req.session.usedPromoCode = true;
            }
            res.redirect ("/shopping-cart/checkout");
        })
    } else {
        req.flash ("noEnter", "You didn't enter a code!");
        res.redirect ("/shopping-cart/checkout");

    }
});

router.post ("/main/charge", function (req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/main/shopping-cart');
    }
    var cart = new Cart(req.session.cart);

    if (req.body.stripeShippingAddressCountry != "United States") {
        req.flash ("notUS", "Sorry, but we only ship to the continental United States at the moment! Because you do not live in our shipping area, we have not charged you. Be aware that until we expand our operations, no Pure Pantheon products will be available outside of the continental United States. Sorry for the inconvenience!");
        return res.redirect ("/shopping-cart/checkout");
    }
    var token = req.body.stripeToken;
    var email = req.body.stripeEmail;
    var address = req.body.stripeShippingAddressLine1 + ": " + req.body.stripeShippingAddressZip + ": " +
        req.body.stripeShippingAddressCity + ", " + req.body.stripeShippingAddressState + ", " + req.body.stripeShippingAddressCountry;
    var shippingName = req.body.stripeShippingName;
    var stripe = require("stripe")(
        "sk_test_gFtvUPvYPrbdCbHnbN4K5s2m"
    );
    var chargeAmount = req.body.chargeAmount;

    var charge = stripe.charges.create ({
        amount:chargeAmount,
        currency: "usd",
        receipt_email: email,
        description: "PURE PANTHEON products",
        source:token
    }, function (err, charge) {
        if (err) {
            req.flash ("error", err.message);
            return res.redirect ("/main/shopping-cart");
        }
        var currentStock;
        var productID = req.body.productID;
        Product.findOne ({title: "ATLAS STRENGTH"}, function (err, product) {
            currentStock = product.stockQuantity;
            Product.findOneAndUpdate ({title: "ATLAS STRENGTH"}, {$set: {stockQuantity: currentStock - cart.totalQty}}, {upsert:true}, function (err, product) {});
        });
        var order = new Order ({
            //user: req.user, // passport creates this when somebody logs in
            email: email,
            cart: cart,
            paymentID: charge.id
        });
        var customer = new Customer ({
            email:email
        });
        var newOrder = new NewOrder ({
            email: email,
            name: shippingName,
            cart: cart,
            address: address,
            paymentID: charge.id
        });
        order.save(function(err, result) {
            if (err) {
                return res.redirect ("/main/shopping-cart");
            }
            newOrder.save (function (err, newOrder) {});
            customer.save (function (err, customer) {});
        });
    });
    req.flash ("success", "Successfully bought a PURE PANTHEON product!");
    req.session.cart = null;
    req.session.oldPrice = null;
    req.session.usedPromoCode = null;
    res.redirect ("/main/supplement");
});

// Invalid Page

router.get ("/main/invalid", function (req, res, next) {
  res.render ("main/invalid");
});

function isBanned (req, res, next) {
  User.findOne ({username:req.session["username"]}, function (err, user) {
    if (!user) {
      res.redirect("/");
    } else if (user.banned === true) {
      return next();
    } else {
      res.redirect("/");
    }
  })
}

function isAdmin(req, res, next) {
    User.findOne ({username: req.session["username"]}, function (err, user) {
        if (!user) {
            return res.redirect ("/");
        } else if (user.admin === true) {
            return next();
        } else {
            res.redirect ("/");
        }
    });
}

function isLoggedIn (req, res, next) {
    if (req.isAuthenticated ()) {
      return next ();
    }
    res.redirect ("/");
}

module.exports = router;


