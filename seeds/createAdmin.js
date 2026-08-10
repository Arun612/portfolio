require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ username: process.env.ADMIN_EMAIL });
    if (existing) {
      console.log('⚠️  Admin user already exists — skipping.');
      return process.exit(0);
    }

    const admin = new User({ email: process.env.ADMIN_EMAIL });
    await User.register(admin, process.env.ADMIN_PASSWORD);
    console.log('✅ Admin user created:', process.env.ADMIN_EMAIL);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create admin:', err);
    process.exit(1);
  }
}

createAdmin();