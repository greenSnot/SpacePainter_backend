var express = require('express');
var router = express.Router();
var db = require('../db/mongo_schema');

router.post('/info', function(req, res) {
  db.Users.findOne({
    _id: req.session.user_id,
  }).exec().then(function(u) {
    if (u) {
      var data = u.wechat;
      data.id = req.session.user_id;
      res.json({
        code: 0,
        data: data
      });
    } else {
      res.json({
        code: -1,
        msg: 'user not found'
      });
    }
  });
});

module.exports = router;
