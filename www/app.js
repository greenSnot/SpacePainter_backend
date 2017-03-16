var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();
var compression = require('compression');
var auth = require('./routes/auth');

app.use(logger('dev'));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// TODO using CDN instead
app.use(express.static(path.join(__dirname, 'public')));

require('./routes/wechat_token').start_token_checker();

// For wechat offical server
app.post('/wechat_code_callback', auth.wechat_code_callback);

app.use(auth.login_checker);
app.use('/wechat', require('./routes/wechat'));
app.get('/', function(req, res) {
  res.json({msg: 'ok'});
});

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

module.exports = app;

// connect db
require('./db/mongo.js').init();
require('./db/redis.js').init();
