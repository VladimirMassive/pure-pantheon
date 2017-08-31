var express = require ("express");
var router = express.Router();
var Vlad = require ("../models/vlad");
var Comic = require ("../models/comics");

var vladTitle;
var vladContent;
var comicTitle;
var comicPath;

router.get ("/vlad-stories", function (req, res, next) {
    var storyChunks = [];
    var comicChunks = [];
    Vlad.find (function (err, docs) {
        var chunkSize = 1;
        for (var i = 0; i < docs.length; i += chunkSize) {
            storyChunks.push (docs.slice (i, i + chunkSize));
        }
    });
    Comic.find(function (err, docs) {
        var chunkSize = 1;
        for (var i = 0; i < docs.length; i += chunkSize) {
            comicChunks.push (docs.slice (i, i + chunkSize));
        }
    });
    res.render ("vlad/vlad-stories", {stories: storyChunks, comics: comicChunks});
});

router.get ("/stories-display/:idBrah", function (req, res, next) {
    Vlad.findOne({_id : req.params.idBrah}, function (err, vlad) {
        if (!vlad) {
            return res.redirect("/");
        }
        res.render("vlad/stories-display", {title: vlad.title, content: vlad.content});
    });
});

router.get ("/comic-display/:id", function (req, res, next) {
    Comic.findOne ({_id: req.params.id}, function (err, comic) {
        if (!comic) {
            return res.redirect ("/");
        }
        res.render ("vlad/comic-display", {title: comic.title, image: comicPath});
    })
});

router.post ("/click", function (req, res, next) {
    res.redirect ("/vlad/stories-display/" + req.body.idBrah);
});

router.post ("/click-comic", function (req, res, next) {
    comicPath = req.body.comicImagePath;
    res.redirect ("/vlad/comic-display/" + req.body.comicid);
});

module.exports = router;