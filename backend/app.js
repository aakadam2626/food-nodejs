const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const userRoutes = require("./routes/user");

const app = express();

mongoose
  .connect(
    "mongodb+srv://abhishekk:FewQlRHKhp9uB2ZN@cluster0.1yqzv.mongodb.net/food-app",
    {useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex: true}
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use( (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods","GET,POST,PATCH, DELETE,OPTIONS");
    next();
});

app.use("/api/users", userRoutes);


module.exports = app;