var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();
var compression = require('compression');
var auth = require('./routes/auth');
var user = require('./routes/user');
var work = require('./routes/work');
var upload = require('./routes/cdn');
var discovery = require('./routes/discovery');

module.exports = app;

// connect db
require('./db/mongo.js').init();
require('./db/redis.js').init();

app.use(logger('dev'));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

require('./routes/wechat_token').start_token_checker();
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});

// For wechat offical server
app.get('/wechat_code_callback', auth.wechat_code_callback);
app.post('/upload_work_callback', upload.upload_work_callback);
app.post('/wechat_redirect_code', auth.wechat_redirect_code);

app.use(auth.login_checker);
app.use('/wechat', require('./routes/wechat'));
app.use('/user', user);
app.use('/work', work);
app.use('/upload', upload.router);
app.use('/discovery', discovery);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.error(err);
  res.json({
    error_message: err.message,
  });
});
