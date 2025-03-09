const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RegistrationCardSchema = new Schema({

  vehicleNumber: {
    type: String,
    required: true,
    unique: true
  },
  ownerName: {
    type: String,
    required: true
  },
  registrationDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  NumContrat: {
    type: String,
    required: true
  },
  
  DriverId: {
    type: Number,
    required: true
  },
  NumImmatricule: {
    type: String,
    required: true
  },
  NumSerie: {
    type: String,
    required: true
  },
  ClassBonus: {
    type: String,
    required: true
  },
  Marque: {
    type: String,
    required: true
  },
  Puissance: {
    type: String,
    required: true
  },
  NbrePlace: {
    type: String,
    required: true
  },
 
 
});

const RegistrationCard = mongoose.model('RegistrationCard', RegistrationCardSchema);
module.exports = RegistrationCard;

