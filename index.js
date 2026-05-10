
//1. dependencies
const express = require('express');
const expressSession = require("express-session");
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');

require('dotenv').config();
const connectDB = require('./config/db')
// 2.Instalations
const app = express();
const port = 5000;

// import usermodel
const Registration = require('./models/Registration')
// 3.configurations
connectDB();
// setting tempalate engines

app.set('view engine', 'pug');
app.set('views',path.join(__dirname,'views'))

// 4.Middleware

app.use(express.static(path.join(__dirname,'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.urlencoded({ extended:true})); //very important
app.use(
    expressSession({
        secret:"My secret",
        resave: false,
        saveUninitialized: false,
    }),
);
app.use(passport.initialize());
app.use(passport.session());

// passport Configurations for salt and harshing passwords
passport.use(Registration.createStrategy());

passport.serializeUser(Registration.serializeUser());
passport.deserializeUser(Registration.deserializeUser());
// 5.Routes
app.use('/',require('./routes/jolidineRoutes'))

// / this is the second last chunk of code:
app.use((req, res) => {
  res.status(404).send("oops !Route not found.");
});

// 6.Bootstraping server
// this is the last line of the code
app.listen(port, () => console.log(`listerning on port ${port}`));

