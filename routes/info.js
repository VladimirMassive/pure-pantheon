var express = require('express');
var router = express.Router();

router.get ("/about-us", function (req, res, next) {
   res.render ("info/about-us");
});

router.get ("/return-policy", function (req, res, next) {
    res.render ("info/return-policy");
});

router.get ("/terms-conditions", function (req, res, next) {
    res.render ("info/terms-conditions");
});

router.get ("/faq", function (req, res, next) {
    res.render ("info/faq");
});

router.get ("/privacy-policy", function (req, res, next) {
    res.render ("info/privacy-policy");
});

module.exports = router;
