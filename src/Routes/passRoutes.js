const express = require('express');
const router = express.Router();
const passController = require('../Controllers/ResetPasswordController');

router.post('/forgot-password', passController.requestPasswordReset);
router.post('/reset-password', passController.resetPassword);

module.exports = router;
