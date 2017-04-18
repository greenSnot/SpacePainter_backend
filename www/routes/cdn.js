var qiniu = require('qiniu');
var redis = require('../db/redis').redis;
var config = require('../config/cdn_config.json');
var express = require('express');
var router = express.Router();
var work_util = require('./work_util');
var uuid = require('shortid');

qiniu.conf.ACCESS_KEY = config.AK;
qiniu.conf.SECRET_KEY = config.SK;

var qn_client = new qiniu.rs.Client();

var token_timeout = 500 * 1000; // 500s
var bucket = config.bucket_name;

var works_file_dir = config.project_name + '/works';

router.post('/work_token', function(req, res) {
  var file_dir = works_file_dir;
  var work_name = req.body.work_name;
  var user_id = req.session.user_id;
  var work_id;
  var filename;
  //TODO
  var description = '';

  work_util.get_work_info_by_name(user_id, work_name).then(function(work_info) {
    filename = uuid.generate();
    response_token(work_info._id, filename);
  }).catch(function(e) {
    work_id = uuid.generate();
    filename = work_id;
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

function upload_work_callback(req, res) {
  var token = req.body.token;
  redis.pipeline().get(token).exec(function(err, results) {
    if (err) {
      res.json({msg: 'unknown', code: -1});
      return;
    }
    if (results[0][1]) {
      results = JSON.parse(results[0][1]);
      var user_id = results[0];
      var work_name = results[1];
      var work_id = results[2];
      var description = results[3];
      var filename = results[4];

      redis.pipeline().del(token).exec(function(err, results) {
        if (err) {
          res.json({msg: 'unknown', code: -2});
          return;
        }
        work_util.get_work_info_by_name(user_id, work_name).then(function(work_info) {
          var old_cdn_filename = work_info.cdn_filename;
          work_util.update_work_cdn_filename(work_info._id, filename).then(function(result) {
            //remove old file
            delete_resource(bucket, works_file_dir + old_cdn_filename).then(function(result) {
              res.json({msg: 'ok', code: 0});
            });
          });
        }).catch(function(e) {
          // not exist
          work_util.create_work(user_id, work_name, description, work_id).then(function(result) {
            res.json({msg: 'ok', code: 0});
          });
        });
      });
    }
  });
}

function get_token(req, bucket, file_dir, filename, cb_url, data) {
  return new Promise(function(resolve, reject) {
    var random_key = uuid.generate();
    var user_id = req.session.user_id;

    redis.pipeline()
         .set(random_key, JSON.stringify(data), 'PX', token_timeout)
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

function delete_resource(bucket, key) {
  return new Promise(function(resolve, reject) {
    qn_client.remove(bucket, key, function(err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function delete_work_by_filename(filename) {
  return delete_resource(bucket, works_file_dir + '/' + filename);
}

module.exports = {
  router: router,
  delete_resource: delete_resource,
  delete_work_by_filename: delete_work_by_filename,
  upload_work_callback: upload_work_callback,
};
