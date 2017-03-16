var config = require('../config/wechat_config.json');
var nodegrass = require('nodegrass');
var redis = require('../db/redis').redis;

var ahead_of_time = 60 * 5 * 1000;

function update_token() {
  var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + config.app_id + '&secret=' + config.app_secret;
  return new Promise(function(resolve, reject) {
    nodegrass.get(url, function(_data, status, headers) {
      var data = JSON.parse(_data);
      var deadline = data.expires_in * 1000 + new Date().valueOf();
      console.log('refresh token: ' + data.access_token);
      redis.pipeline()
           .set('wechat_access_token', data.access_token)
           .set('wechat_access_deadline', deadline)
           .exec(function(err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    }, 'utf-8').on('error', function(e) {
      reject(e);
    });
  });
}

function update_ticket(access_token) {
  var url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + access_token + '&type=jsapi';
  return new Promise(function(resolve, reject) {
    nodegrass.get(url, function(_data, status, headers) {
      var data = JSON.parse(_data);
      var deadline = data.expires_in * 1000 + new Date().valueOf();
      redis.pipeline()
           .set('wechat_ticket', data.ticket)
           .set('wechat_ticket_deadline', deadline)
           .exec(function(err, results) {
        if (err) {
          reject(err);
        } else {
          console.log('refresh ticket: ' + data.ticket);
          resolve(data);
        }
      });
    },'utf-8').on('error', function(e) {
      reject(e);
    });
  });
}

module.exports.start_token_checker = function() {
  update_token().then(function(data) {
    var timeout = data.expires_in * 1000 - ahead_of_time;
    setTimeout(module.exports.start_token_checker, timeout);
    update_ticket(data.access_token);
  });
};

module.exports.get_token = function() {
  return new Promise(function(resolve, reject) {
    redis.get('wechat_access_token', function(err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports.get_ticket = function() {
  return new Promise(function(resolve, reject) {
    redis.get('wechat_ticket', function(err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};
