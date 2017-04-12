var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uuid = require('shortid');

var worksSchema = mongoose.Schema({
  _id: {
    type: String,
    default: uuid.generate
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  user: {
    type: String,
    ref: 'Users'
  },
  cdn_filename: {
    type: String,
  },
  likes: {
    type: Number,
  },
  views: {
    type: Number,
  },
  created_time: {
    type: Number,
  },
  updated_time: {
    type: Number,
  },
  comments: [
    {
      type: String,
      ref: 'Comments'
    }
  ],
});

var usersSchema = mongoose.Schema({
  _id: {
    type: String,
    default: uuid.generate
  },
  name: {
    type: String,
    index: true,
    required: true,
    unique: true
  },
  nickname: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  wechat: {
    openid: String,
    nickname: String,
    headimgurl: String,
    region: String,
    sex: Number,
    language: String,
    unionid:String,
    city: String,
    province: String,
    country: String
  },
  works: [
    {
      type: String,
      ref: 'Works'
    }
  ],
  favorites: [
    {
      type: String,
      ref: 'Works'
    }
  ],
  created_time: {
    type: Number,
  },
});

var commentsSchema = mongoose.Schema({
  _id: {
    type: String,
    default: uuid.generate
  },
  content: {
    type: String,
    required: true
  },
  rx: {
    type: Number,
  },
  ry: {
    type: Number,
  },
  reply_to: {
    type: String,
    ref: 'Users'
  },
  user: {
    type: String,
    ref: 'Users'
  },
  work: {
    type: String,
    ref: 'Works'
  },
  created_time: {
    type: Number,
  },
});

exports.Users = mongoose.model('Users', usersSchema);
exports.Works = mongoose.model('Works', worksSchema);
exports.Comments = mongoose.model('Comments', commentsSchema);
