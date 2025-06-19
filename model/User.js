const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  instituteName: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique:true
  },
  password: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imageId: {
    type: String,
    required: true,
  },
});

const User = module.exports = mongoose.model('User', userSchema);
