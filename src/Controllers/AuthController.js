const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const Admin = require('../Models/adminModel');
// Inscription (signup)
exports.signup = async (req, res) => {
  try {
    // Récupérer les données du formulaire d'inscription
    const { username, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà dans la base de données
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Cet utilisateur existe déjà.' });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const newUser = new Admin({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Inscription réussie.' });
  } catch (error) {
    res.status(500).json({ message: 'Une erreur est survenue lors de l\'inscription.' });
  }
};

// Connexion (login)
exports.login = async (req, res) => {
  try {
    // Récupérer les données du formulaire de connexion
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe dans la base de données
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }


    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Identifiants invalides2.' });
    }
    // Générer un token JWT
    const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Une erreur est survenue lors de la connexion.' });
  }
};
