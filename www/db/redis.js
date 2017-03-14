var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var Redis = require('ioredis');
var config = require('../config/redis_client.json');
var app = require('../app.js');

var redis = new Redis(config.connect);

app.use(session({
  resave: false,
  saveUninitialized: true,
  store: new RedisStore(config.session),
  rolling: true,
  secret: config.session_secret,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

module.exports.redis = redis;
