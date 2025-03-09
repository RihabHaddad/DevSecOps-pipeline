const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DriveKPISchema = new Schema({

  DriverId: {
    type: String,
    required: true
  },
  MeanSpeed: {
    type: Number,
    required: true
  },
  MaxSpeed: {
    type: Number,
    required: true
  },
  StdSpeed: {
    type: Number,
    required: true
  },
  HarshAcceleration: {
    type: Number,
    required: true
  },
  HarshBraking: {
    type: Number,
    required: true
  },
  HarshCornering: {
    type: Number,
    required: true
  },
  NightDriving: {
    type: Boolean,
    required: true
  }

});

const DriveKPI = mongoose.model('DriveKPI', DriveKPISchema);
module.exports = DriveKPI;
