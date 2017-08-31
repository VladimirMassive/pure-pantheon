var passport = require ("passport");
var User = require ("../models/user");
var LocalStrategy = require ("passport-local").Strategy;

passport.serializeUser (function (user, done) {
    done (null, user.id); // when you want to store user in session serialize it by id
}); // tell passport how to store user in the session

passport.deserializeUser (function (id, done){
    User.findById(id, function (err, user){
        done (err, user); // returning the error if you got one, or return the user successfully
    });
});

// Sign-Up Strategy

passport.use ("local.signup", new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true
}, function (req, username, password, done) { // this is the callback that request is turned to
    if (req.body.email) {
        req.checkBody ("email", "Invalid email").isEmail();
    }
    req.checkBody ("username", "Invalid username").notEmpty(); // to check if email add .isEmail() // method provided by express-validator
    req.checkBody ("password", "Invalid password").notEmpty().isLength({min:7});
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach (function (error) {
            messages.push (error.msg);
        });
        return done(null, false, req.flash("error", messages));
    }
    User.findOne({"username": username}, function (err, user) {
        if (err) {
            return done(err);
        }
        if (user) { // if user already exists
            return done(null, false, {message: "Username is already in use"});
        }
        req.session["username"] = username;
        var newUser = new User ();
        newUser.username = username;
        newUser.email = req.body.email;
        newUser.password = newUser.encryptPassword (password);
        newUser.save (function (err, result) {
            if (err) {
                return done(err);
            }
            return done(null, newUser);
        });
    });
}));

passport.use ("local.signin", new LocalStrategy ({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true
}, function (req, username, password, done) {
    req.checkBody ("username", "Invalid username").notEmpty();
    req.checkBody ("password", "Invalid password").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach (function (error) {
           messages.push (error.msg);
        });
        return done (null, false, req.flash ("error", messages));
    }

    User.findOne ({"username": username}, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {message: "No user found"});
        }
        if (!user.validPassword(password)) {
            return done(null, false, {message: "Wrong Password"});
        }
        req.session["username"] = username;
        return done(null, user);
    });
}));







