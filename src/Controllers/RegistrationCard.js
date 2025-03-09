const mongoose = require('mongoose');
const RegistrationCard = require('../Models/registrationCardModel.js');
const User = require('../Models/userModel.js')
exports.createNewRegistration = async (req, res) => {
  try {
    const cardData = req.body;

    const newCard = new RegistrationCard({
      vehicleNumber: cardData.vehicleNumber,
      ownerName: cardData.ownerName,
      registrationDate: cardData.registrationDate,
      expiryDate: cardData.expiryDate,
      NumContrat: cardData.NumContrat,
      DriverId: cardData.DriverId,
      NumImmatricule: cardData.NumImmatricule,
      NumSerie: cardData.NumSerie,
      ClassBonus: cardData.ClassBonus,
      Marque: cardData.Marque,
      Puissance: cardData.Puissance,
      NbrePlace: cardData.NbrePlace,
    });
    
    const savedCard = await newCard.save();

    // Trouvez l'utilisateur auquel associer la carte en fonction du DriverId
    const user = await User.findOne({ DriverId: cardData.DriverId }); // Recherchez l'utilisateur avec le DriverId correspondant

    if (user) {
      // Ajoutez l'ID de la carte d'enregistrement à la liste des cartes de l'utilisateur
      user.registrationCards.push(savedCard._id);

      // Sauvegardez les modifications
      await user.save();
    }

    res.status(201).json(savedCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the registration card.' });
  }
};
    exports.getAllRegistration=async (req, res, next) => {
    try {
      const registrations = await RegistrationCard.find({}, { __v: 0 });
      res.send(registrations);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
  
  exports.findRegistrationById= async (req, res, next) => {
    const id = req.params.id;
    try {
      const registration = await RegistrationCard.findById(id);
      if (!registration) {
        throw createError(404, 'Registration does not exist.');
      }
      res.send(registration);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        next(createError(400, 'Invalid registration id'));
        return;
      }
      next(error);
    }
  },
  
  exports.updateRegistration= async (req, res, next) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      const options = { new: true };
  
      const result = await RegistrationCard.findByIdAndUpdate(id, updates, options);
      if (!result) {
        throw createError(404, 'Registration does not exist');
      }
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        return next(createError(400, 'Invalid Registration Id'));
      }
      next(error);
    }
  },
  
  exports.deleteRegistration= async (req, res, next) => {
    const id = req.params.id;
    try {
      const result = await RegistrationCard.findByIdAndDelete(id);
      if (!result) {
        throw createError(404, 'Registration does not exist in the collection');
      }
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        next(createError(400, 'Invalid Registration id'));
        return;
      }
      next(error);
    }
  },
  
  exports.getAllCardNumber= async (req, res, next) => {
    try {
      const cardNumbers = await RegistrationCard.distinct('DriverId');
      res.send(cardNumbers);
    } catch (error) {
      console.log(error.message);
      next(error);
    }


    const MongoClient = require('mongodb').MongoClient;

    exports.calculateCarsByBrand() = async (req, res) => {
      const url = 'mongodb://root:rootpassword@192.168.136.7:27017/';
      const dbName = 'test';
      const collectionName = 'registationcards';
    
      try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
    
        const pipeline = [
          {
            $group: {
              _id: '$brand',
              totalCars: { $sum: 1 }
            }
          }
        ];
    
        const result = await collection.aggregate(pipeline).toArray();
    
        client.close();
    
        return result;
      } catch (error) {
        console.error('Erreur lors du calcul du nombre de voitures par marque :', error);
        throw error;
      }
    }
    
    // Utilisation de la fonction
    calculateCarsByBrand()
      .then(result => {
        console.log('Nombre de voitures par marque :', result);
      })
      .catch(error => {
        console.error('Une erreur s\'est produite :', error);
      });
    

   
  }
    
    
    
    
  