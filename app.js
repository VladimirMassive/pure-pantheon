var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require ("express-handlebars"); // get this with npm install --save express-handlebars
var mongoose = require ("mongoose"); // npm install --save mongoose
var session = require ("express-session");
var passport = require ("passport");
var flash = require ("connect-flash");
var validator = require ("express-validator"); // start this validator after the bodyparser is done
var MongoStore = require ("connect-mongo") (session);

var routes = require('./routes/index');
var enhancementRoutes = require("./routes/enhancement");
var vladRoutes = require ("./routes/vlad");
var adminRoutes = require ("./routes/admin");
var infoRoutes = require ("./routes/info");

var app = express();

mongoose.connect("localhost:27017/profiles"); // /db will be created for you
require ("./config/passport");

// view engine setup
app.engine (".hbs", expressHbs({defaultLayout: "layout", extname: ".hbs"}))
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use (validator());
app.use(cookieParser());
app.use (session({
  secret: "mySecret",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore ({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 180 * 60 * 1000 } // must be returned in milliseconds
})) // for resave the default is true but the default is deprecated. If it is set to true it will save the session to the server each time no matter if anything changed or not. The default for saveUnitialized is true and is also deprecated. If it is true something might be stored on the server even if it wasn't yet initialized

app.use (flash()); // flash needs session to be initialized first since it uses session
app.use (passport.initialize());
app.use (passport.session());
app.use(express.static(path.join(__dirname, 'public'))); // express.js middleware needed to serve images in the public folder

app.use (function (req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});

app.use ("/info", infoRoutes);
app.use ("/vlad", vladRoutes);
app.use("/enhancement", enhancementRoutes);
app.use ("/admin", adminRoutes);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  //return res.redirect ("/main/invalid");
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
