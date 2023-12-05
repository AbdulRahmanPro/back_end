const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const action = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    unique: true
  },
  url:{
    type:String,
    default: 'https://www.twitch.tv/noubi_elaziz' 
  }
});


module.exports = mongoose.model('action', action);
