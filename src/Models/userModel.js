const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new mongoose.Schema({
  _id: { 
    type: Schema.Types.ObjectId, 
    required: true },

  DriverId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  cin: {
    type: String,
    required: true
  },
  drivingLicense: {
    type: String,
    required: true
  },
  registrationCards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RegistrationCard'
  }]
});


module.exports = mongoose.model('users', userSchema);