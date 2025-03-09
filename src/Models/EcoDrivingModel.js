const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EcoDriveKPISchema = new Schema({
  HighRPM: {
    type: Number
  },
  Idling: {
    type: Number
  },
  Cruising: {
    type: Number
  },
  GearShiftUp: {
    type: Number
  },
  FuelConsumption: {
    type: Number
  },
  DriverId: {
    type: String
  }
});

const EcoDriveKPI = mongoose.model('EcoDrivingKPIs', EcoDriveKPISchema);
module.exports = EcoDriveKPI;

