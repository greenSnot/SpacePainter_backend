var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uuid = require('node-uuid');

var worksSchema = mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v1
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Users'
  }
});

var usersSchema = mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v1
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
      type: Schema.Types.ObjectId,
      ref: 'Works'
    }
  ],
  favorites: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Works'
    }
  ],
});

var commentsSchema = mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v1
  },
  content: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
  work: {
    type: Schema.Types.ObjectId,
    ref: 'Works'
  }
});

exports.Users = mongoose.model('Users', usersSchema);
exports.Works = mongoose.model('Works', worksSchema);
exports.Works = mongoose.model('Comments', commentsSchema);
