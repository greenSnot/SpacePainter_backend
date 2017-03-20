var db = require('../db/mongo_schema');
var uuid = require('shortid');

function get_work_info_by_name(user_id, work_name) {
  return new Promise(function(resolve, reject) {
    db.Users.find({
      _id: req.session.user_id,
    }).populate({
      path: 'works',
      select: {
      //  _id: 1,
      //  cdn_filename: 1,
      },
      match: {
        name: name
      },
      options: {
      }
    }).exec().then(function(data) {
      if (data) {
        resolve(data);
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
      //TODO error check
      //TODO add work id to Users ?
      resolve(work_id);
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
  get_work_id_by_name: get_work_id_by_name,
  update_work_cdn_filename: update_work_cdn_filename,
  create_work: create_work,
};
