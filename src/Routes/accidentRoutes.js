
router.get('/accident/:deviceid', AccidentController.getAccidentInfoByDeviceIdAndDate);

router.get('/accidents/all', AccidentController.getAllAccidents);

router.get('/accident/number/:DeviceId', AccidentController.findNumberAccidentByDeviceId);
// accidents.js
const express = require('express');
const router = express.Router();
const Accident = require('./accident');

// Endpoint pour récupérer tous les accidents
router.get('/', async (req, res) => {
  try {
    const accidents = await Accident.find();
    res.json(accidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
