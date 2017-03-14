var express = require('express');
var utils = require('../utils');
var config = require('./config');
var db = require('../db/mongo_schema');
var nodegrass = require('nodegrass');

function is_wechat_browser() {
  return req.headers['user-agent'] && req.headers['user-agent'].indexOf('MicroMessenger') >= 0;
}

function wechat_code_callback(req, res) {
  //TODO
  var redirect_url = '';
  function get_token_by_code(code) {
    var get_info_token= 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.app_id + '&secret=' + config.app_secret + '&code=' + code + '&grant_type=authorization_code';
    return new Promise(function(resolve, reject) {
      nodegrass.get(get_code_token_url, function(data, status, headers) {
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
        console.log(data);
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

  function update_old_user_info_and_login(user_data) {
    req.session.user_id = user_data._id;
    req.session.save();
    next();
  }

  function create_new_user(user_info) {
    var model = new db.Users({
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
    model.save(function(result) {
      return db.Users.findOne({
        'wechat.openid': user_info.openid
      }).then(function(result) {
        req.session.user = result._id;
        req.session.save();
        console.log('new wechat user');
        next();
      });
    });
  }

  function update_user_info(user_info) {
    db.Users.findOne({
      'wechat.openid': data.openid
    }).then(function(user, err) {
      if (user) {
        update_old_user_info_and_login(user);
      } else {
        create_new_user(user_info);
      }
    });
  }

  get_info_token(req.query.code).then(function(token_data) {
    return get_userinfo(token_data);
  }).then(function(user_info) {
    update_user_info(user_info);
  });
}

function logout(req) {
  req.session.user = undefined;
  req.session.user_type = undefined;
  req.session.save();
}

exports.login_checker = function(req, res, next) {
  var user_id = req.session ? req.session.user_id : undefined;
  if (user_id) {
    db.Users.findOne({
      _id: user_id
    }).then(function(u) {
      if (u) {
        next();
        return;
      }
      logout();
      console.log('user ' + user_id + ' is not exist');
      res.redirect(req.originalUrl);
    });
    return;
  }

  if (!is_wechat_browser()) {
    //TODO
    res.json({});
    return;
  }

  var full_url = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.writeHead(301, {
    'Location': 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.app_id + '&redirect_uri=' + utils.urlencode(full_url) + '&response_type=code&scope=snsapi_userinfo&state=WECHAT_OAUTH_RESPONSE#wechat_redirect'
  });
  res.end();
};
