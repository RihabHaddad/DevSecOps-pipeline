const mongoose = require('mongoose');
const Admin = require('../Models/adminModel');
const User = require('../Models/userModel');
module.exports = {
getAllAdmins: async (req, res, next) => {
    try {
      const results = await Admin.find({}, { __v: 0 });
      res.send(results);
    } catch (error) {
      console.log(error.message);
    }
  },

findAdminById: async (req, res, next) => {
    const id = req.params.id;
    
    try {
      const admin = await Admin.findById(id);
      if (!admin) {
        throw createError(404, 'Admin does not exist.');
      }
      res.send(admin);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        next(createError(400, 'Invalid Admin id'));
        return;
      }
      next(error);
    }
  },
updateAdmin: async (req, res, next) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      const options = { new: true };
      console.log(req.params);
      console.log(req.body);

      const result = await Admin.findByIdAndUpdate(id, updates, options);
      if (!result) {
        throw createError(404, 'Admin does not exist');
      }
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        return next(createError(400, 'Invalid Admin Id'));
      }

      next(error);
    }
  },
deleteAdmin: async (req, res, next) => {
    const id = req.params.id;
    try {
      const result = await Admin.findByIdAndDelete(id);
      
      if (!result) {
        throw createError(404, 'Admin does not exist.');
      }
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        next(createError(400, 'Invalid Admin id'));
        return;
      }
      next(error);
    }
  },}