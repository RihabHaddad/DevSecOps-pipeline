const User = require('../Models/userModel');
const Assure = require('../Models/userModel');
const DriveKPI = require('../Models/DriverkpiModel');
const DriverBehavior = require('../Models/DriverBehaviorkpis');
const MongoClient = require('mongodb').MongoClient;


exports.createAssure = async (req, res) => {
  try {
    const {  DriverId, username, firstName, lastName, email, phoneNumber, cin, drivingLicense } = req.body;

    const existingUser = await User.findOne({ DriverId});
    if (existingUser) {
      return res.status(409).json({ message: 'L\'utilisateur existe déjà' });
    }

    const newUser = new User({
      DriverId,
      username,
      firstName,
      lastName,
      email,
      phoneNumber,
      cin,
      drivingLicense
    });
    const createdUser = await newUser.save();

    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ message: 'Une erreur est survenue lors de la création de l\'utilisateur.' });
  }
};

exports.getAllAssure = async (req, res) => {
  try {
    const results = await User.find({}, { __v: 0 });
    res.send(results);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des assurés.' });
  }
};

exports.getAssureById = async (req, res) => {
  try {
    
    const assureId = req.params._id;
    console.log("Assure ID:", assureId);
    const assure = await User.findOne({ _id: assureId });
    console.log("Résultat de la recherche:", assure);

    if (!assure) {
      return res.status(404).json({ message: 'Assuré non trouvé.' });
    }

    res.status(200).json(assure);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération de l\'assuré.' });
  }
};

exports.updateAssure = async (req, res) => {
  try {
    const assureId = req.params._id;
    const updates = req.body;
    const updatedAssure = await User.findByIdAndUpdate(assureId, updates, { new: true });

    if (!updatedAssure) {
      return res.status(404).json({ message: 'Assuré non trouvé.' });
    }

    res.status(200).json(updatedAssure);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'assuré :', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour de l\'assuré.' });
  }
};

exports.deleteAssure = async (req, res) => {
  try {
    const assureId = req.params.id;
    const deletedAssure = await User.findByIdAndDelete(assureId);

    if (!deletedAssure) {
      return res.status(404).json({ message: 'Assuré non trouvé.' });
    }

    res.status(200).json({ message: 'Assuré supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Une erreur est survenue lors de la suppression de l\'assuré.' });
  }
};

exports.calculateTotalUsersFromDatabase = async (req, res) => {
  const url = 'mongodb://root:rootpassword@192.168.136.7:27017/';
  const dbName = 'test';
  const collectionName = 'users';

  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const totalUsers = await collection.countDocuments({});

    client.close();

    res.status(200).json({ totalUsers });
  } catch (error) {
    console.error('Erreur lors du calcul du nombre d\'utilisateurs :', error);
    res.status(500).json({ message: 'Une erreur est survenue lors du calcul du nombre total d\'utilisateurs.' });
  }
};









exports.getAllDriverKPI = async (req, res) => {
  try {
    const results = await DriveKPI.find();
    res.send(results);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des données KPI de conduite.' });
  }
};

exports.getDriveBehaviourByDriverId = async (req, res) => {
  try {
    const driverId = req.params.id;
    const results = await DriverBehavior.find({ DriverId: driverId });
    res.send(results);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des comportements de conduite.' });
  }
};