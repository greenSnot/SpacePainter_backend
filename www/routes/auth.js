var express = require('express');
var urlencode = require('urlencode');
var config = require('../config/wechat_config.json');
var db = require('../db/mongo_schema');
var nodegrass = require('nodegrass');
var host_config = require('../config/host_config.json');
var redis = require('../db/redis').redis;
var uuid = require('uuid');

module.exports.wechat_code_callback = function(req, res) {
  redis.get(req.query.state, function(err, results) {
    if (err) {
      res.json({code: -2});
      return;
    }
    var redirect_url = results;
    function get_token_by_code(code) {
      var get_info_token_url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.app_id + '&secret=' + config.app_secret + '&code=' + code + '&grant_type=authorization_code';
      return new Promise(function(resolve, reject) {
        nodegrass.get(get_info_token_url , function(data, status, headers) {
          try {
            data = JSON.parse(data);
          } catch(e) {
            console.log("WECHAT ERROR");
            console.error(data);
            reject(e);
            return;
          }

          resolve(data);
        });
      });
    }

    function get_userinfo(token_data) {
      var userinfo_url = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + token_data.access_token + '&openid=' + token_data.openid + '&lang=zh_CN';
      return new Promise(function(resolve, reject) {
        nodegrass.get(userinfo_url, function(data, status, headers) {
          try{
            data = JSON.parse(data);
          } catch(e) {
            console.log('WECHAT ERROR');
            reject(e);
            return;
          }
          resolve(data);
        });
      });
    }

    function redirect() {
      res.writeHead(301, {
        'Location': redirect_url
      });
      res.end();
    }

    function update_old_user_info_and_login(user_data) {
      req.session.user_id = user_data._id;
      req.session.save();
      redirect();
    }

    function create_new_user(user_info) {
      var model = new db.Users({
        _id: uuid.v1(),
        name: user_info.openid,
        nickname: user_info.nickname,
        password: 'no password',
        wechat: {
          openid: user_info.openid,
          nickname: user_info.nickname,
          headimgurl: user_info.headimgurl,
          region: user_info.region,
          sex: user_info.sex,
          language: user_info.language,
          unionid: user_info.unionid || 'none',
          city: user_info.city,
          province: user_info.province,
          country: user_info.country
        },
        works: [],
        favorites: [],
      });
      model.save().then(function(result) {
        return db.Users.findOne({
          'wechat.openid': user_info.openid
        }).exec().then(function(result) {
          req.session.user = result._id;
          req.session.save();
          console.log('new wechat user');
          redirect();
        });
      });
    }

    function update_user_info(user_info) {
      db.Users.findOne({
        'wechat.openid': user_info.openid
      }).exec().then(function(user, err) {
        if (user) {
          update_old_user_info_and_login(user);
        } else {
          create_new_user(user_info);
        }
      });
    }

    get_token_by_code(req.query.code).then(function(token_data) {
      return get_userinfo(token_data);
    }).then(function(user_info) {
      update_user_info(user_info);
    });
  });
};

function logout(req) {
  req.session.user = undefined;
  req.session.user_type = undefined;
  req.session.save();
}

module.exports.wechat_redirect_code = function(req, res) {
  var url = req.body.url;
  var random_id = Math.floor(Math.random() * 1000000);
  redis.pipeline().set(random_id, url, 'PX', 1000 * 60).exec(function(err, results) {
    if (err) {
      res.json({code: -1});
      return;
    }
    res.json({code: 0, data: {
      redirect_code: random_id
    }});
  });
};

module.exports.login_checker = function(req, res, next) {
  var user_id = req.session ? req.session.user_id : undefined;
  if (user_id) {
    db.Users.findOne({
      _id: user_id
    }).exec().then(function(u) {
      if (u) {
        next();
        return;
      }
      logout();
      console.log('user ' + user_id + ' is not exist');
      res.redirect(req.originalUrl);
    });
    return;
  } else {
    res.json({code: -1, msg: 'need to login'});
    return;
  }
};
