var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var routes = require('./routes/index');
var mongo = require('./routes/mongodb');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(require('node-compass')({mode: 'expanded'}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);
app.get("/zecretary.appcache", routes.appcache);
app.post('/join', mongo.join);
app.get('/checkemail', mongo.checkEmail);
app.post('/login', mongo.login);
app.post('/findid', mongo.findid);
app.post('/findpw', mongo.findpw);
app.post('/todo', mongo.postTodo);
app.get('/todo', mongo.getTodo);
app.put('/upload', mongo.upload);
app.put('/download', mongo.download);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


app.listen(1044, "0.0.0.0", function () {
  console.log('server running on port 1044');
});
