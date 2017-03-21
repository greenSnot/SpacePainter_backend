var express = require('express');
var router = express.Router();
var db = require('../db/mongo_schema');

router.post('/', function(req, res) {
  var type = req.body.type || 'popular';
  var skip = req.body.skip || 0;
  var limit = req.body.limit || 10;
  limit = limit > 10 ? 10 : limit;

  db.Works.find({
    //TODO
  }).skip(skip).limit(limit).exec(function(err, result) {
    if (err) {
      console.error(err);
      res.json({
        code: -1,
        msg: 'err'
      });
      return;
    }
    res.json({
      code: 0,
      data: result
    });
  });
});
module.exports = router;
