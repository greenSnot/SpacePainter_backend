var db = require('../db/mongo_schema');
var uuid = require('shortid');

var WorkSortType = {
  popular: 1,
  latest: 2,
};

var WorkSortBy = {};
WorkSortBy[WorkSortType.popular] = 'views';
WorkSortBy[WorkSortType.latest] = 'created_time';

function get_work_info_by_name(user_id, work_name) {
  return new Promise(function(resolve, reject) {
    db.Users.findOne({
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
        reject();
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
      likes: 0,
      views: 0,
      comments: [],
      created_time: Date.now(),
      updated_time: Date.now(),
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
    db.Works.update({
      _id: work_id
    }, {
      $set: {
        cdn_filename: cdn_filename,
        updated_time: Date.now(),
      }
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

function find_works(opts) {
  let condition = {};
  if (opts.user_id) {
    condition.user = user_id;
  }

  return db.Works.find(condition).skip(skip).limit(limit).sort(WorkSortBy[type]).exec();
}

module.exports = {
  get_work_info_by_name: get_work_info_by_name,
  update_work_cdn_filename: update_work_cdn_filename,
  create_work: create_work,
  WorkSortType: WorkSortType,
};
