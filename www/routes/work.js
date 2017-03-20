var express = require('express');
var router = express.Router();
var db = require('../db/mongo_schema');

router.post('/info', function(req, res) {
  var work_id = req.body.work_id;
  db.Works.findOne({
    _id: work_id,
  }).then(function(work_info) {
    res.json({
      code: 0,
      data: work_info
    });
  });
});

module.exports = router;
