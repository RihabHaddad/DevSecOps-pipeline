const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Admin = require('../Models/adminModel');
const bcrypt = require('bcrypt');

// Request Password Reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const resetToken = crypto.randomBytes(20).toString('hex');
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Set reset token and expiration in user document
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000000; // Token expires in 1 hour
    await user.save();

  
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rihab.haddad@esprit.tn',
        pass: 'rihabAPPCDPRO',
      },
    });
    const mailOptions = {
      from: 'rihab.haddad@esprit.tn',
      to: user.email,
      subject: 'Password Reset',
      text: `You are receiving this email because you (or someone else) has requested a password reset. Please click on the following link to reset your password: ${resetToken}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent.' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while processing the request.' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find user by reset token and check expiration
    const user = await Admin.findOne({
      resetToken,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    // Update user's password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while processing the request.' });
  }
};
