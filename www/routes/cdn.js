var qiniu = require('qiniu');
var redis = require('../db/redis').redis;
var config = require('../config/cdn_config.json');
var express = require('express');
var router = express.Router();
var work_util = require('./work_util');
var uuid = require('shortid');

qiniu.conf.ACCESS_KEY = config.AK;
qiniu.conf.SECRET_KEY = config.SK;

var token_timeout = 500 * 1000; // 500s

router.post('/work_token', function(req, res) {
  var bucket = config.bucket_name;
  var file_dir = 'works';
  var work_name = req.body.work_name;
  var user_id = req.session.user_id;
  var work_id;
  var filename;
  //TODO
  var description = '';

  work_util.get_work_info_by_name(user_id, work_name).then(function(work_info) {
    if (!work_info) {
      work_id = uuid.generate();
      filename = work_id;
    } else {
      work_id = work_info._id;
      filename = uuid.generate();
    }
    response_token(work_id, filename);
  });

  function response_token(work_id, filename) {
    var cb_url = req.protocol + '://' + req.get('host') + '/upload_work_callback';

    var data = [user_id, work_name, work_id, description, filename];

    get_token(req, bucket, file_dir, filename, cb_url, data).then(function(token) {
      res.json({
        code: 0,
        data: {
          token: token,
          key: file_dir + '/' + filename,
        }
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
      var filename = result[4];

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
            work_util.update_work_cdn_filename(work_id, filename).then(function(result) {
              res.json({msg: 'ok', code: 0});
            });
          }
        });
      });
    }
  });
});

function get_token(req, bucket, file_dir, filename, cb_url, data) {
  return new Promise(function(resolve, reject) {
    var random_key = uuid.generate();
    var user_id = req.session.user_id;

    redis.pipeline()
         .set(random_key, data, 'PX', token_timeout)
         .exec(function(err, result) {
      if (err) {
        reject(err);
        return;
      }
      var file_url = bucket + ':' + file_dir + '/' + filename;
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
