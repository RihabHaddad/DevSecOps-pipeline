const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationsSchema = new Schema({
  DriverId: {
    type: String,
    required: true
  },
  Title: {
    type: String,
    required: true
  },
  Date: {
    type: Date,
    required: true
  }
});



const Notifications = mongoose.model('Notifications', NotificationsSchema);
module.exports = Notifications;

