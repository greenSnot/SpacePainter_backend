var qiniu = require('qiniu');
var redis = require('../db/redis').redis;
var config = require('../config/cdn_config.json');
var express = require('express');
var router = express.Router();
var work_util = require('./work_util');
var uuid = require('node-uuid');

qiniu.conf.ACCESS_KEY = config.AK;
qiniu.conf.SECRET_KEY = config.SK;

var token_timeout = 500 * 1000; // 500s

router.post('/work_token', function(req, res) {
  var bucket = 'infinityisle';
  var file_path = 'works/';
  var work_name = req.body.work_name;
  var user_id = req.session.user_id;
  //TODO
  var description = '';

  work_util.get_work_id_by_name(user_id, work_name).then(function(work_id) {
    if (!work_id) {
      work_id = uuid.v1();
    }
    response_token_by_work_id(work_id);
  });
  function response_token_by_work_id(work_id) {
    var file_name =  work_id;
    var cb_url = req.protocol + '://' + req.get('host') + '/upload_work_callback';

    var data = [user_id, work_name, work_id, description];

    get_token(req, bucket, file_path, file_name, cb_url, data).then(function(token) {
      res.json({
        token: token
      });
    });
  }
});

router.post('/work_callback', function(req, res) {
  var token = req.body.token;
  redis.pipeline().get(token).exec(function(err, results) {
    if (err) {
      res.json({msg: 'unknown', code: -1});
      return;
    }
    if (results) {
      var user_id = results[0];
      var work_name = results[1];
      var work_id = results[2];
      var description = result[3];

      redis.pipeline().remove(token).exec(function(err, results) {
        if (err) {
          res.json({msg: 'unknown', code: -2});
          return;
        }
        work_util.get_work_id_by_name(user_id, work_name).then(function(work_id) {
          if (!work_id) {
            work_util.create_work(user_id, work_name, description, work_id).then(function(result) {
              //TODO
              res.json({msg: 'ok', code: 0});
            });
          } else {
            // work exists so do nothing
            res.json({msg: 'ok', code: 0});
          }
        });
      });
    }
  });
});

function get_token(req, bucket, file_path, file_name, cb_url, data) {
  return new Promise(function(resolve, reject) {
    var random_key = uuid.v1();
    var user_id = req.session.user_id;

    redis.pipeline()
         .set(random_key, data, 'PX', token_timeout)
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
