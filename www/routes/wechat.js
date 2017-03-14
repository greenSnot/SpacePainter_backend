var config = require('../config/wechat_config.json');
var express = require('express');
var router = express.Router();
var nodegrass = require('nodegrass');
var sha1 = require('sha1');
var get_ticket = require('./wechat_token').get_ticket;

router.post('/ticket', function(req, res) {
  if (!req.body.url) {
    res.json({
      code: -9,
      msg: 'error'
    });
    return;
  }

  get_ticket().then(function(ticket) {
    var date = parseInt(new Date().valueOf() / 1000);
    //TODO
    var noncestr = 'whatever';
    var signature = sha1(
        'jsapi_ticket=' + ticket +
        '&noncestr=' + noncestr +
        '&timestamp=' + date +
        '&url=' + req.body.url);
    res.json({
      timestamp: date,
      noncestr: noncestr,
      signature: signature
    });
  });
});

module.exports = router;
