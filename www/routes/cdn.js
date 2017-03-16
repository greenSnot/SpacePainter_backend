var qiniu = require('qiniu');
var redis = require('../db/redis').redis;
var config = require('../config/cdn_config.json');
var express = require('express');
var router = express.Router();

qiniu.conf.ACCESS_KEY = config.AK;
qiniu.conf.SECRET_KEY = config.SK;

var token_timeout = 500 * 1000; // 500s

router.post('/upload/work_token', function(req, res) {
  var bucket = 'infinityisle';
  var user_id = req.session.user_id;
  var file_path = 'works/' + user_id + '/';
  var file_name = Math.random() + '.sp';
  //TODO
  var cb_url = '';

  get_token(req, bucket, file_path, file_name, cb_url).then(function(token) {
    res.json({
      token: token
    });
  });
});

router.post('/upload/work_callback', function(req, res) {
  var token = req.body.token;
  redis.pipeline().get(token).exec(function(err, results) {
    if (err) {
      res.json({msg: 'unknown', code: -1});
      return;
    }
    if (results) {
      res.json({msg: 'ok', code: 0});
    }
  });
});

function get_token(req, bucket, file_path, file_name, cb_url) {
  return new Promise(function(resolve, reject) {
    var random_key = 'random' + math.random() + '666';
    var user_id = req.session.user_id;

    redis.pipeline()
         .set(random_key, user_id, 'PX', token_timeout)
         .exec(function(err, result) {
      if (err) {
        reject(err);
        return;
      }
      var file_url = bucket + ':' + file_path + '/' + file_name;
      var parameters = 'name=$(fname)&hash=$(etag)' + '&token=' + random_key;
      var putPolicy = new qiniu.rs.PutPolicy(
        file_url,
        cb_url,
        parameters
      );
      var token = putPolicy.token();
      resolve(token);
    });
  });
}
module.exports = router;
