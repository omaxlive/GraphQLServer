const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const connectDB = async () => {
  try {
    const { MONGO_USER, MONGO_PASSWORD_ENCODED, MONGO_PATH } = process.env;
    await mongoose.connect(
      `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD_ENCODED}${MONGO_PATH}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      () => console.log('connected to DB!')
    );
  } catch (error) {
    console.log('ERROR:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
