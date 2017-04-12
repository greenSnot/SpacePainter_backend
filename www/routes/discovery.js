let express = require('express');
let router = express.Router();
let db = require('../db/mongo_schema');
let work_util = require('./work_util');

router.post('/', function(req, res) {
  var data;
  work_util.find_works({
    type: req.body.type || work_util.WorkSortType.popular,
    skip: req.body.skip || 0,
    limit: Math.min(req.body.limit || 10, 10)
  }).then(function(result) {
    data = result;
    return db.Works.count().exec();
  }).then(function(count) {
    res.json({
      code: 0,
      data: data,
      count: count
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
