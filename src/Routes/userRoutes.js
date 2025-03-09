const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/UserController');
const { requestPasswordReset, resetPassword } = require('../Controllers/ResetPasswordController');


router.get('/', UserController.getAllAdmins);
router.put('/updateuser/:id', UserController.updateAdmin);
router.delete('/deleteuser/:id', UserController.deleteAdmin);

module.exports = router;


