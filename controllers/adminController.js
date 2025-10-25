const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try to find admin by email instead of username
    let admin = await Admin.findOne({ email });

    // If there's no admin, create default admin only if no other admin exists
    if (!admin) {
      const anyAdmin = await Admin.findOne();
      if (!anyAdmin) {
        try {
          // create default admin with email
          admin = await Admin.create({
            email: 'admin@example.com',
            password: 'admin123'
          });
        } catch (err) {
          if (err.code !== 11000) throw err;
        }
      }
      // try finding the admin again after potential creation
      admin = await Admin.findOne({ email });
    }

    if (admin && (await admin.matchPassword(password))) {
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.json({
        success: true,
        token,
        admin: {
          id: admin._id,
          email: admin.email,
        },
        message: 'Login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  loginAdmin,
};