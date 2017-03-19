var db = require('../db/mongo_schema');
var uuid = require('node-uuid');

function get_work_id_by_name(user_id, work_name) {
  return new Promise(function(resolve, reject) {
    db.Users.find({
      _id: req.session.user_id,
    }).populate({
      path: 'works',
      select: {
        _id: 1,
      },
      match: {
        name: name
      },
      options: {
      }
    }).exec().then(function(data) {
      if (data) {
        resolve(data._id);
      } else {
        reject(undefined);
      }
    });
  });
}

function create_work(user_id, work_name, description, work_id) {
  work_id = work_id || uuid.v1();
  description = description || '';
  return new Promise(function(resolve, reject) {
    var model = new db.Works({
      _id: work_id,
      name: work_name,
      description: description,
      user: user_id,
    });
    model.save().then(function(result) {
      //TODO error check
      //TODO add work id to Users ?
      resolve(work_id);
    });
  });
}

module.exports = {
  get_work_id_by_name: get_work_id_by_name,
  create_work: create_work,
};
