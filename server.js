const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require('./src/Routes/authRoutes');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const AdminRoute = require('./src/Routes/userRoutes');
const PassRoutes = require('./src/Routes/passRoutes');
const AssureRoutes = require('./src/Routes/assureRoutes');
const RegistrationcarRoutes = require('./src/Routes/registrationRoutes');
const User = require('./src/Models/userModel');
const MongoClient = require('mongodb').MongoClient;
const DriveKPI = require('./src/Models/DriverkpiModel');
const http = require('http');
const EcoDrivingKPIs = require('./src/Models/EcoDrivingModel');
const Accident = require('./src/Models/accidentModel');


// Middleware pour le traitement des données JSON
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(function(req, res, next) {
  // ... (configuration CORS)
  next();
});

require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const config = require(`./src/config/config.${env}.json`);

mongoose.connect(config.MONGODB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB établie'))
  .catch((err) => console.error('Erreur de connexion à MongoDB', err));
// Connexion à la base de données MongoDB

  app.get('/userscards', async (req, res) => {
    try {
      const users = await User.find().populate('registrationCards');
      res.json(users);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
// Routes d'authentification
app.use('/api/auth', authRoutes);
app.use('/api/car', RegistrationcarRoutes)
app.use('/api/Admins', AdminRoute);
app.use('/', PassRoutes);
app.use('/api/assures', AssureRoutes);
app.get('/kpi/:driverId', async (req, res) => {
  try {
    const pfeMongoURI = 'config.MONGODB_CONNECTION_STRING';
    const mongoDB = 'PFE';
    
    const client = new MongoClient(pfeMongoURI);
    await client.connect();
    const db = client.db(mongoDB);

    const DriverBehaviorKPIsCollection = db.collection('DriverBehaviorKPIs'); // Utilisez directement la collection

    const driverId = req.params.driverId;
    console.log('Requested driverId:', driverId);
    console.log('Fetching driver KPIs...');
    
    const driverKPIs = await DriverBehaviorKPIsCollection.find({ DriverId: driverId }).toArray();
    
    console.log('Driver KPIs:', driverKPIs);

    await client.close(); // Fermez la connexion

    res.status(200).json(driverKPIs);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des KPI du conducteur.' });
  }
});


app.get('/acc', async (req, res) => {
  try {
    const env = process.env.NODE_ENV || 'development';
    const config = require(`./src/config/config.${env}.json`);

    const pfeMongoURI = 'config.MONGODB_CONNECTION_STRING';
    const mongoDB = 'PFE';
    
    const client = new MongoClient(pfeMongoURI);
    await client.connect();
    const db = client.db(mongoDB);

    const AccidentsCollection = db.collection('Accidents'); // Utilisez directement la collection "Accidents"

    console.log('Fetching accidents...');
    
    const accidents = await AccidentsCollection.find().toArray();
    
    console.log('Accidents:', accidents);

    await client.close(); // Fermez la connexion

    res.status(200).json(accidents);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des accidents.' });
  }
});

  
 

app.get('/search', (req, res) => {
  const searchTerm = req.query.username;
  console.log('Received search request for:', searchTerm);
  if (!searchTerm) {
    return res.status(400).json({ message: 'Veuillez fournir un terme de recherche valide' });
  }

  User.find({
    $or: [
      { firstName: { $regex: new RegExp(searchTerm, 'i') } },
      { lastName: { $regex: new RegExp(searchTerm, 'i') } },
      { email: { $regex: new RegExp(searchTerm, 'i') } }
    ]
  })
    .then(users => {
      if (users.length === 0) {
        return res.status(404).json({ message: 'Aucun utilisateur trouvé' });
      }
      res.json(users);
    })
    .catch(error => res.status(500).json({ message: 'Une erreur est survenue lors de la recherche des utilisateurs', error }));
});
app.get('/calculateTotalUsers', async (req, res) => {
  try {
    const totalUsers = await calculateTotalUsersFromDatabase();
    res.status(200).json({ totalUsers });
  } catch (error) {
    console.error('Une erreur s\'est produite lors du calcul du nombre total d\'utilisateurs :', error);
    res.status(500).json({ message: 'Une erreur est survenue lors du calcul du nombre total d\'utilisateurs.' });
  }
});
app.get('/calculateCarsByBrand', async (req, res) => {
  try {
    const result = await calculateCarsByBrand();
    res.status(200).json(result);
  } catch (error) {
    console.error('Une erreur s\'est produite lors du calcul du nombre de voitures par marque :', error);
    res.status(500).json({ message: 'Une erreur est survenue lors du calcul du nombre de voitures par marque.' });
  }
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
async function calculateCarsByBrand() {
  const env = process.env.NODE_ENV || 'development';
  const config = require(`./src/config/config.${env}.json`);

  const url =  'config.MONGODB_CONNECTION_STRING';
  const dbName = 'test';
  const collectionName = 'registrationcards';

  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const pipeline = [
      {
        $group: {
          _id: '$Marque',
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
// Gestionnaire d'erreurs



// Fonction pour calculer le nombre total d'utilisateurs à partir de la base de données
async function calculateTotalUsersFromDatabase() {
  const env = process.env.NODE_ENV || 'development';
const config = require(`./src/config/config.${env}.json`);
 
  const url = 'config.MONGODB_CONNECTION_STRING';
  const dbName = 'test';
  const collectionName = 'users';

  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const totalUsers = await collection.countDocuments({});
    
    client.close();

    return totalUsers;
  } catch (error) {
    console.error('Erreur lors du calcul du nombre d\'utilisateurs :', error);
    throw error;
  }
}

const Kafka = require('node-rdkafka');
app.get('/api/latestSpeedData', (req, res) => {
  // Get the latest speed and time from the arrays
  const latestSpeed = speedData.length > 0 ? speedData[speedData.length - 1] : 0;
  const latestTime = timeData.length > 0 ? new Date(timeData[timeData.length - 1]) : new Date();

  res.json({
      time: latestTime,
      speed: latestSpeed
  });
});


app.get('/api/latestSpeedData', (req, res) => {
    // Get the latest speed and time from the arrays
    const latestSpeed = speedData.length > 0 ? speedData[speedData.length - 1] : 0;
    const latestTime = timeData.length > 0 ? new Date(timeData[timeData.length - 1]) : new Date();

    res.json({
        time: latestTime,
        speed: latestSpeed
    });
});

//kafka

const kafkaConf = {
  'group.id': 'my-consumer-group',
  'metadata.broker.list': '192.168.136.6:9092'
};

const topicName = 'rawdata';

const consumer = new Kafka.KafkaConsumer(kafkaConf, {});

consumer.connect();

let driver1SpeedData = []; // Array to store speed data for DriverId 1
let driver1TimeData = [];  // Array to store time data for DriverId 1

consumer.on('ready', () => {
  consumer.subscribe([topicName]);
  consumer.consume();
});

consumer.on('data', (message) => {
  const messageValue = message.value.toString();
  console.log(`Message received: ${messageValue}`);

  // Parse the messageValue and extract relevant data
  const data = JSON.parse(messageValue);
  console.log('Parsed data:', data);

  const currentTime = new Date(data.time).getTime(); // Convert time to milliseconds
  const currentSpeed = parseFloat(data.SPEED);
  const driverId = data.DriverId;

  // Check if the DriverId matches the desired value (1)
  if (driverId === "1") {
      // Add data to arrays for DriverId 1
      driver1SpeedData.push(currentSpeed);
      driver1TimeData.push(currentTime);
  }
});

app.get('/api/driver1Data', (req, res) => {
  // Convert driver1TimeData to an array of formatted date strings
  const formattedDriver1TimeData = driver1TimeData.map(time => new Date(time).toLocaleString());

  // Return the arrays of driver1SpeedData and formattedDriver1TimeData
  res.json({
      speedData: driver1SpeedData,
      timeData: formattedDriver1TimeData
  });
});



//eco drive
app.get('/ecodrivingkpis/:driverId', async (req, res) => {
  
  try {
    const env = process.env.NODE_ENV || 'development';
const config = require(`./src/config/config.${env}.json`);

    const pfeMongoURI = 'config.MONGODB_CONNECTION_STRING';
    const mongoDB = 'PFE';
    
    const client = new MongoClient(pfeMongoURI);
    await client.connect();
    const db = client.db(mongoDB);

    const EcoDrivingKPIsCollection = db.collection('EcoDrivingKPIs'); // Utilisez directement la collection

    const driverId = req.params.driverId;
    console.log('Requested driverId:', driverId);
    console.log('Fetching ecodrivingkpis...');
    const ecodrivingKPIs = await EcoDrivingKPIsCollection.find({ DriverId: driverId }).toArray();
    console.log('EcoDriving KPIs:', ecodrivingKPIs);

    await client.close(); // Fermez la connexion

    res.status(200).json(ecodrivingKPIs);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des KPIs ecodriving.' });
  }
});




//kafka notif 


consumer.connect();

const sseConnections = new Map();

const twilio = require('twilio');


// Configuration de la connexion à MongoDB
const uri = 'config.MONGODB_CONNECTION_STRING';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Configuration Twilio
const twilioAccountSid = 'AC54810e599e6ecd0e1502c6206533c37c';
const twilioAuthToken = '7803b2f4cbc5a8725a27bae42bedc799';
const twilioPhoneNumber = '+19208755729';

const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

consumer.on('data', (message) => {
    const messageValue = message.value.toString();
    const data = JSON.parse(messageValue);

    const currentSpeed = parseFloat(data.SPEED);
    const driverId = data.DriverId;

    // ...

if (currentSpeed > 100) {
  const driverId = data.DriverId;
  const notification = {
    driverId,
    speed: currentSpeed,
    message: `Driver ${driverId} has exceeded the speed limit with a speed of ${currentSpeed} km/h`
};

const sseResponse = `data: ${JSON.stringify(notification)}\n\n`;
if (sseConnections.has(driverId)) {
    sseConnections.get(driverId).forEach(connection => {
        connection.write(sseResponse);
    });
}

  // Établir une connexion à MongoDB
  client.connect(async (err) => {
      if (err) {
          console.error('Erreur lors de la connexion à MongoDB :', err);
          return;
      }
      const driverId = data.DriverId;
      const db = client.db('test');
      const driversCollection = db.collection('users');

      // Recherche du conducteur dans MongoDB par ID
      try {
          const User= await driversCollection.findOne({ driverId: DriverId });
          if (User) {
              const driverPhoneNumber = User.phoneNumber;

              // Envoyer un message au numéro de téléphone du conducteur en utilisant Twilio
              const notificationMessage = `Driver ${DriverId} has exceeded the speed limit with a speed of ${currentSpeed} km/h`;

              twilioClient.messages
                  .create({
                      body: notificationMessage,
                      from: twilioPhoneNumber,
                      to: driverPhoneNumber
                  })
                  .then((message) => console.log(`Message Twilio envoyé avec succès : ${message.sid}`))
                  .catch((error) => console.error('Erreur lors de l\'envoi du message Twilio :', error));
              
              // Ensuite, vous pouvez envoyer la notification en streaming ou via d'autres moyens comme précédemment.
          } else {
              console.log(`Conducteur avec l'ID ${driverId} introuvable dans MongoDB.`);
          }
      } catch (error) {
          console.error('Erreur lors de la recherche du conducteur dans MongoDB :', error);
      } finally {
          // Fermer la connexion à MongoDB
          client.close();
      }
  });
}

});

app.use(express.static(__dirname + '/public'));

app.get('/sse/:driverId', (req, res) => {
    const driverId = req.params.driverId;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*' // Allow CORS
    });

    if (!sseConnections.has(driverId)) {
        sseConnections.set(driverId, []);
    }
    
    sseConnections.get(driverId).push(res);

    req.on('close', () => {
        const connections = sseConnections.get(driverId);
        const index = connections.indexOf(res);
        if (index !== -1) {
            connections.splice(index, 1);
            if (connections.length === 0) {
                sseConnections.delete(driverId);
            }
        }
    });
});
//map
const driverLocations = new Map();
consumer.on('data', (message) => {
  const messageValue = message.value.toString();
  const data = JSON.parse(messageValue);

  const driverId = data.DriverId;
  const latitude = parseFloat(data.Latitude);
  const longitude = parseFloat(data.Longitude);

  // Mettez à jour la localisation du conducteur dans la Map
  driverLocations.set(driverId, { latitude, longitude });
});

app.get('/api/drivers', (req, res) => {
  const driversArray = Array.from(driverLocations, ([driverId, location]) => ({ driverId, ...location }));
  res.json(driversArray);
});





app.get('/api/total-distance/:driverId', async (req, res) => {
  const env = process.env.NODE_ENV || 'development';
const config = require(`./src/config/config.${env}.json`);

const mongoURI = 'config.MONGODB_CONNECTION_STRING';
const mongoDB = 'PFE';
const mongoTotalCollection = 'TotalDistance';
  const driverId = req.params.driverId;

  const client = new MongoClient(mongoURI);
  await client.connect();
  const db = client.db(mongoDB);
  const totalCollection = db.collection(mongoTotalCollection);

  try {
    const result = await totalCollection.findOne({ 'DriverId': driverId });
    res.json(result ? result.TotalDistance : 0);
  } catch (error) {
    console.error('Failed to fetch total distance:', error);
    res.status(500).json({ error: 'Failed to fetch total distance' });
  } finally {
    client.close();
  }
});
app.get('/api/distance/:driverId', async (req, res) => {
  const env = process.env.NODE_ENV || 'development';
const config = require(`./src/config/config.${env}.json`);

  const mongoURI = 'config.MONGODB_CONNECTION_STRING';
  const mongoDB = 'PFE';
  const mongoCollection = 'Distance';
  const driverId = req.params.driverId;
  
  const client = new MongoClient(mongoURI);
  await client.connect();
  const db = client.db(mongoDB);
  const distCollection = db.collection(mongoCollection);
  
  try {
    const results = await distCollection.find({ 'DriverId': driverId }).toArray();
    const distancesAndTimes = results.map(result => ({
      Distance: result.Distance,
      Time: result.Time
    }));
    res.json(distancesAndTimes);
  } catch (error) {
    console.error('Failed to fetch distances and times:', error);
    res.status(500).json({ error: 'Failed to fetch distances and times' });
  } finally {
    client.close();
  }
});

app.get('/api/fuel/:driverId', async (req, res) => {
  const env = process.env.NODE_ENV || 'development';
const config = require(`./src/config/config.${env}.json`);

  const mongoURI = 'config.MONGODB_CONNECTION_STRING';
  const mongoDB = 'PFE';
  const mongoCollection = 'EcoDrivingKPIs';
  const driverId = req.params.driverId;
  
  const client = new MongoClient(mongoURI);
  await client.connect();
  const db = client.db(mongoDB);
  const distCollection = db.collection(mongoCollection);
  
  try {
    const results = await distCollection.find({ 'DriverId': driverId }).toArray();
    const Fuel = results.map(result => ({
      
FuelConsumption: result.
FuelConsumption,
     
    }));
    res.json(Fuel);
  } catch (error) {
    console.error('Failed to fetch distances and times:', error);
    res.status(500).json({ error: 'Failed to fetch distances and times' });
  } finally {
    client.close();
  }
});

const ratingSchema = new mongoose.Schema({
  value: Number, 
  DriverId: String,// Assuming 'value' is where you store the rating value
  // Add more fields as needed
});

const Rating = mongoose.model('Rating', ratingSchema);

app.post('/api/ratings/:DriverId', async (req, res) => {
  try {
    // Crée un nouveau document de notation et enregistre-le dans la base de données
    const ratingValue = req.body.rating; // Récupère la valeur du rating depuis le champ 'value'
    const driverId = req.params.DriverId; // Récupère le DriverId depuis les paramètres de l'URL

    const newRating = new Rating({
      value: ratingValue,
      DriverId: driverId, // Utilisez le bon nom de champ pour DriverId
    });

    const savedRating = await newRating.save();

    console.log('Saved rating:', savedRating);

    res.json({ message: 'Rating received and saved successfully' });
  } catch (error) {
    console.error('Error saving rating:', error);
    res.status(500).json({ error: 'An error occurred while saving the rating' });
  }
});




// Démarrer le serveur
app.listen(8002, async () => {
  console.log('Serveur démarré sur le port 8002');
  
  try {
    const totalUsers = await calculateTotalUsersFromDatabase();
    console.log(`Le nombre total d'utilisateurs est : ${totalUsers}`);
  } catch (error) {
    console.error('Une erreur s\'est produite lors du calcul du nombre total d\'utilisateurs :', error);
  }
});