const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // await mongoose.connect(process.env.DB_URI, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true
    // });
    await mongoose.connect(process.env.DB_URI).then(()=>{
      console.log('MongoDB connected');
    }).catch((error)=>{
      console.log('Database connection error:', error)
    })
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
