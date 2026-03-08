const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb';

// Connect to MongoDB

const ConnectDb = async()=>{
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("connection succesfull to db");
  } catch (error) {
    console.error("connection fail to db");
    process.exit(0)
  }
}

app.get('/', (req, res) => {
  res.send('Server is running.');
});

// Start server
ConnectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});
