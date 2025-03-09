// accident.js
const mongoose = require('mongoose');

const accidentSchema = new mongoose.Schema({
  altitude: Number,
  latitude: Number,
  longitude: Number,
  DriverId: String,
  // Ajoutez d'autres champs selon vos besoins
});

module.exports = mongoose.model('Accident', accidentSchema, 'Accidents');
