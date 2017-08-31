var express = require('express');
var router = express.Router();

var User = require ("../models/user");
var Product = require ("../models/product");
var NewOrder = require ("../models/newOrders");
var Cart = require ("../models/cart");
var Customer = require ("../models/customers");
var Code = require ("../models/codes");



router.get ("/new-orders", isAdmin, function (req, res, next) {
    NewOrder.find (function (err, newOrders) {
        var cart;
        newOrders.forEach (function (newOrder) {
            cart = new Cart (newOrder.cart);
            newOrder.items = cart.generateArray();
        });
        res.render ("admin/new-orders", {newOrders: newOrders, numOrders: newOrders.length});})
});

router.post ("/fulfill-order", function (req, res, next) {
    var id = req.body.orderID;
    if (req.body.orderCheckBox) {
        NewOrder.remove({_id:id}, function (err, neworder) {
            if (err) {
                console.log (err);
            }
        });
    }
    res.redirect ("/admin/new-orders");
});

router.get ("/set-quantity", isAdmin, function (req, res, next) {
    Product.find(function (err, products) {
        if (err) {
            console.log (err);
        }
        res.render ("admin/set-quantity", {products:products});
    })
});

router.post ("/add-stock", isAdmin, function (req, res, next) {
    var newQuantity;
    var addStock = parseInt(req.body.numToAdd);
    if (isNaN(addStock)) {
        return res.redirect ("/admin/set-quantity");
    } else {
        Product.findOne ({_id:req.body.productID}, function (err, product) {
            newQuantity = product.stockQuantity + addStock;
            Product.findOneAndUpdate ({_id:req.body.productID}, {$set: {stockQuantity: newQuantity}}, {upsert:true}, function (err, product) {
                if (err) {
                    console.log (err);
                }
            });
        });
        return res.redirect ("/admin/set-quantity");
    }
});

router.post ("/take-stock", isAdmin, function (req, res, next) {
    var newQuantity;
    var takeStock = parseInt(req.body.numToTake);
    if (isNaN(takeStock)) {
        return res.redirect ("/admin/set-quantity");
    } else {
        Product.findOne ({_id:req.body.productID}, function (err, product) {
            newQuantity = product.stockQuantity - takeStock;
            Product.findOneAndUpdate ({_id:req.body.productID}, {$set: {stockQuantity: newQuantity}}, {upsert:true}, function (err, product) {
                if (err) {
                    console.log (err);
                }
            });
        });
        return res.redirect ("/admin/set-quantity");
    }
});

router.get ("/mailing-list", isAdmin, function (req, res, next) {
    User.find (function (err, users) {
        Customer.find (function (err, customers) {
            res.render ("admin/mailing-list", {users:users, customers:customers});
        });
    })
});

router.get ("/coupon-codes", isAdmin, function (req, res, next) {
    Code.find (function (err, codes) {
        res.render ("admin/coupon-codes", {codes:codes});
    })
});

router.post ("/add-coupon-code", function (req, res, next) {
    var newCode = new Code ({
        code: req.body.addCode
    });
    newCode.save (function (err, newCode) {
        if (err) {
            return err;
        }
    });
    res.redirect ("/admin/coupon-codes");
});

router.post ("/delete-coupon-code", function (req, res, next) {
    var codeName = req.body.deleteCode;
    Code.findOneAndRemove ({code:codeName}, function (err, code) {
        if (err) {
            console.log (err);
        }
        if (!code) {
            console.log ("Code: " + codeName + " doesn't exist!");
        }
        res.redirect ("/admin/coupon-codes");
    });
});


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

module.exports = router;

