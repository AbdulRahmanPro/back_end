const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const session = new mongoose.Schema({
    profile_id: {
    type: String,
    required: true,
    unique: true
  }, 
  token: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },  
  comment:{
    type:Array,
    required:true
  }
}, { timestamps: true });


module.exports = mongoose.model('session', session);
