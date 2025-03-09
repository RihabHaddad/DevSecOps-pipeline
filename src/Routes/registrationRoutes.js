const express = require('express');
const registrationController = require('../Controllers/RegistrationCard');

const router = express.Router();

router.post('/addcar', registrationController.createNewRegistration);
router.get('/', registrationController.getAllRegistration);
router.put('/updatecar/:id', registrationController.updateRegistration);
router.delete('/deletecar/:id', registrationController.deleteRegistration);
router.get('/:id', registrationController.findRegistrationById);
router.get('/count-by-marque', (req, res) => {
    registrationController.getvoitureparmarque()
      .then((result) => {
        res.json(result);
      })
      .catch((error) => {
        console.error('Error while fetching car count by marque:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des voitures par marque.' });
      });
  });
module.exports = router;
