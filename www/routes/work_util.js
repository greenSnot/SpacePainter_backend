var db = require('../db/mongo_schema');
var uuid = require('shortid');

function get_work_info_by_name(user_id, work_name) {
  return new Promise(function(resolve, reject) {
    db.Users.find({
      _id: user_id,
    }).populate({
      path: 'works',
      match: {
        name: work_name,
      },
      options: {
        limit: 1
      }
    }).exec().then(function(data) {
      if (data.works[0]) {
        resolve(data.works[0]);
      } else {
        resolve(undefined);
      }
    });
  });
}

function create_work(user_id, work_name, description, work_id) {
  work_id = work_id || uuid.generate();
  description = description || '';
  cdn_filename = work_id;
  return new Promise(function(resolve, reject) {
    var model = new db.Works({
      _id: work_id,
      name: work_name,
      description: description,
      user: user_id,
      cdn_filename: cdn_filename,
    });
    model.save().then(function(result) {
      db.Users.update({
        _id: user_id,
      }, {
        $push: {
          works: work_id
        }
      }).exec(function(result) {
        resolve(work_id);
      });
    });
  });
}

function update_work_cdn_filename(work_id, cdn_filename) {
  return new Promise(function(resolve, reject) {
    db.Wroks.update({
      _id: work_id
    }, {
      cdn_filename: cdn_filename
    }, {
      upsert: false
    }, function(err, result) {
      if (err) {
        reject(result);
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = {
  get_work_info_by_name: get_work_info_by_name,
  update_work_cdn_filename: update_work_cdn_filename,
  create_work: create_work,
};
