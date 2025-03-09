const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdvicesSchema = new Schema({
  Textadvice: {
    type: String,
    required: true
  },
  Causeadvice: {
    type: String,
    required: true
  },
  DriverId: {
    type: String,
    required: true
  },
  Date: {
    type: Date,
    required: true
  }
});



const Advices = mongoose.model('Advices', AdvicesSchema);
module.exports = Advices;

