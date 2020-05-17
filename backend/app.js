// ./mongo "mongodb+srv://cluster0-wjd79.mongodb.net/test"  --username marianaac --password 0g49uXC1C7cqOLcU
const path = require('path');
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect(`mongodb+srv://marianaac:${process.env.MONGO_ATLAS_PASSWORD}@cluster0-wjd79.mongodb.net/mean-app?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('Connected to database!');
})
.catch((error) => {
  console.log('Connection failed!');
  console.log(error)
})

//middleware that parses response body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// any requests targeting /images are allowed to access folder and be forward to ./images in the BE folder
    // relative path from where nodemon is running (root)
app.use("/images", express.static(path.join('backend/images')));
app.use((req, res, next) => {
  // to define domains that can send requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  // to define the type of headers that incoming headers may have
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT, OPTIONS');
  next();
});

app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);

module.exports = app;
