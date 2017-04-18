var express = require('express');
var router = express.Router();
var db = require('../db/mongo_schema');
var work_util = require('./work_util');

router.post('/info', function(req, res) {
  var work_id = req.body.work_id;
  db.Works.findOne({
    _id: work_id,
  }).exec().then(function(work_info) {
    res.json({
      code: 0,
      data: work_info
    });
  });
  db.Works.update({
    _id: work_id,
  }, {
    $inc: {
      views: 1
    }
  }).exec();
});

router.post('/praise', function(req, res) {
  //TODO
  db.Works.update({
    _id: req.body.work_id,
  }, {
    $inc: {
      likes: 1
    }
  }).exec().then(function(result) {
    res.json({
      code: 0,
    });
  }).catch(function(e) {
    console.error(e);
    res.json({
      code: -1,
      msg: 'unknown'
    });
  });
});

router.post('/delete', function(req, res) {
  let work_id = req.body.work_id;
  let user_id = req.session.user_id;
  work_util.delete_work(work_id, user_id).then(function(r) {
    res.json({
      code: 0,
    });
  }).catch(function(e) {
    console.error(e);
    res.json({
      code: -1,
      msg: 'unknown'
    });
  });
});

module.exports = router;
