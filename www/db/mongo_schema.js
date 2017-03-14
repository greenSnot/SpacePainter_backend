var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var worksSchema = mongoose.Schema({
  id: {
    type: String,
    index: true,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  user_id: String
}, {
  _id: true,
  autoIndex: true
});

var usersSchema = mongoose.Schema({
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
      work_id: String
    }
  ],
  favorites: [
    {
      work_id: String
    }
  ],
}, {
  _id:true,
  autoIndex:true
});

exports.Users = mongoose.model('Users', usersSchema);
exports.Works = mongoose.model('Works', worksSchema);
