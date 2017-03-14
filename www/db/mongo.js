var mongoose = require('mongoose');
var config = require('../config/mongo_client.json');

mongoose.connect(config.mongodb_url, config.connect);
var con = mongoose.connection;
con.on('error', function(e) {
  console.log('mongodb connect failed');
  console.log(e);
});
con.once('open', function(e) {
  console.log('mongodb connected');
});
