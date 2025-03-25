const express = require('express');
const app = express();
require('dotenv').config();
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

// Prometheus monitoring setup
const prometheus = require('prom-client');
const collectDefaultMetrics = prometheus.collectDefaultMetrics;

collectDefaultMetrics(); // Collect default system metrics

// Define custom metrics
const userCountMetric = new prometheus.Gauge({
  name: 'total_users_count',
  help: 'Total number of users in the database'
});

const carCountByBrandMetric = new prometheus.Gauge({
  name: 'total_cars_count_by_brand',
  help: 'Total number of cars by brand'
});

// Middleware pour le traitement des données JSON
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use(function(req, res, next) {
  next();
});

// Connexion à MongoDB
const env = process.env.NODE_ENV || 'development';
const config = require(`./src/config/config.${env}.json`);

// Utilisation de mongoose pour connecter à MongoDB
mongoose.connect(config.MONGODB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB établie'))
  .catch((err) => console.error('Erreur de connexion à MongoDB', err));

// Routes d'authentification et autres
app.use('/api/auth', authRoutes);
app.use('/api/car', RegistrationcarRoutes);
app.use('/api/Admins', AdminRoute);
app.use('/', PassRoutes);
app.use('/api/assures', AssureRoutes);

// Route pour obtenir tous les utilisateurs
app.get('/userscards', async (req, res) => {
  try {
    const users = await User.find().populate('registrationCards');
    res.json(users);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route pour obtenir les KPI du conducteur
app.get('/kpi/:driverId', async (req, res) => {
  try {
    const pfeMongoURI = process.env.MONGODB_CONNECTION_STRING;
    const mongoDB = 'PFE';
    const client = new MongoClient(pfeMongoURI);
    await client.connect();
    const db = client.db(mongoDB);
    const DriverBehaviorKPIsCollection = db.collection('DriverBehaviorKPIs');

    const driverId = req.params.driverId;
    console.log('Requested driverId:', driverId);
    const driverKPIs = await DriverBehaviorKPIsCollection.find({ DriverId: driverId }).toArray();
    console.log('Driver KPIs:', driverKPIs);

    await client.close();
    res.status(200).json(driverKPIs);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des KPI du conducteur.' });
  }
});

// Route pour obtenir les accidents
app.get('/acc', async (req, res) => {
  try {
    const pfeMongoURI = process.env.MONGODB_CONNECTION_STRING;
    const mongoDB = 'PFE';
    const client = new MongoClient(pfeMongoURI);
    await client.connect();
    const db = client.db(mongoDB);
    const AccidentsCollection = db.collection('Accidents');
    const accidents = await AccidentsCollection.find().toArray();
    console.log('Accidents:', accidents);

    await client.close();
    res.status(200).json(accidents);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des accidents.' });
  }
});

// Recherche d'utilisateur par nom
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

// Route pour calculer le nombre total d'utilisateurs
app.get('/calculateTotalUsers', async (req, res) => {
  try {
    const totalUsers = await calculateTotalUsersFromDatabase();
    userCountMetric.set(totalUsers); // Update Prometheus metric
    res.status(200).json({ totalUsers });
  } catch (error) {
    console.error('Une erreur s\'est produite lors du calcul du nombre total d\'utilisateurs :', error);
    res.status(500).json({ message: 'Une erreur est survenue lors du calcul du nombre total d\'utilisateurs.' });
  }
});

// Route pour calculer le nombre de voitures par marque
app.get('/calculateCarsByBrand', async (req, res) => {
  try {
    const result = await calculateCarsByBrand();
    carCountByBrandMetric.set(result.length); // Update Prometheus metric
    res.status(200).json(result);
  } catch (error) {
    console.error('Une erreur s\'est produite lors du calcul du nombre de voitures par marque :', error);
    res.status(500).json({ message: 'Une erreur est survenue lors du calcul du nombre de voitures par marque.' });
  }
});

// Fonction pour calculer le nombre de voitures par marque
async function calculateCarsByBrand() {
  const pfeMongoURI = process.env.MONGODB_CONNECTION_STRING;
  const dbName = 'test';
  const collectionName = 'registrationcards';

  try {
    const client = await MongoClient.connect(pfeMongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
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

// Fonction pour calculer le nombre total d'utilisateurs
async function calculateTotalUsersFromDatabase() {
  const pfeMongoURI = process.env.MONGODB_CONNECTION_STRING;
  const dbName = 'test';
  const collectionName = 'users';

  try {
    const client = await MongoClient.connect(pfeMongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
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

// Route pour les KPIs d'écoconduite
app.get('/ecodrivingkpis/:driverId', async (req, res) => {
  try {
    const pfeMongoURI = process.env.MONGODB_CONNECTION_STRING;
    const mongoDB = 'PFE';
    const client = new MongoClient(pfeMongoURI);
    await client.connect();
    const db = client.db(mongoDB);
    const EcoDrivingKPIsCollection = db.collection('EcoDrivingKPIs');

    const driverId = req.params.driverId;
    console.log('Requested driverId:', driverId);
    const ecodrivingKPIs = await EcoDrivingKPIsCollection.find({ DriverId: driverId }).toArray();
    console.log('EcoDriving KPIs:', ecodrivingKPIs);

    await client.close();
    res.status(200).json(ecodrivingKPIs);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des KPIs écoconduite.' });
  }
});

// Route pour exposer les métriques Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});

// SSE pour les notifications en temps réel
app.get('/sse/:driverId', (req, res) => {
  const driverId = req.params.driverId;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Gérer les connexions SSE
  const connection = res;
  if (!sseConnections.has(driverId)) {
    sseConnections.set(driverId, []);
  }
  sseConnections.get(driverId).push(connection);

  // Fermer la connexion lorsque la requête est terminée
  req.on('close', () => {
    sseConnections.get(driverId).splice(sseConnections.get(driverId).indexOf(connection), 1);
  });
});

// Fonction pour envoyer des notifications aux connexions SSE
function sendSSE(driverId, message) {
  const connections = sseConnections.get(driverId);
  if (connections) {
    connections.forEach((connection) => {
      connection.write(`data: ${JSON.stringify(message)}\n\n`);
    });
  }
}

const sseConnections = new Map();

const server = http.createServer(app);

// Port d'écoute
const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
