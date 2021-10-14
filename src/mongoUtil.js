const mongoose = require('mongoose');
const uri = `mongourlhere`;

var _client;
const userModel = mongoose.model('users', mongoose.Schema({
  username:  String,
  password: String,
  token:   String,
  created: { type: Date, default: Date.now },
  id: Number,
}));

const imageModel = mongoose.model('images', mongoose.Schema({
  filename: String, 
  user: String,
  url: String,
  oembed: String,
  date: { type: Date, default: Date.now },
  embed: {
    title: { type: String, required: false },
    author: { type: String, required: false },
    description: { type: String, required: false },
    colour: { type: String, required: false }
  }
}));

var inviteModel = mongoose.model('invites', new mongoose.Schema({ 
  invite: String, 
  user: String, 
  created: { type: Date, default: Date.now } 
}));

module.exports = {
  connectToServer: function( callback ) {
    mongoose.connect( uri,  { useNewUrlParser: true, useUnifiedTopology: true })
  },

  getImageModel: function() {
    return imageModel;
  },

  getUserModel: function() {
    return userModel;
  },

  getInviteModel: function() {
    return inviteModel;
  }
};
