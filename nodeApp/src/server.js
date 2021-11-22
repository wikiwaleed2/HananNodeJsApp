﻿require('rootpath')();
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('C:\\Certbot\\live\\api.dreammakers.ae\\privkey.pem', 'utf8');
var certificate = fs.readFileSync('C:\\Certbot\\live\\api.dreammakers.ae\\fullchain.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./_middleware/error-handler');
const {getGoogleAccountFromCode, getFbAccountFromCode} = require('./google-util');
const passport = require('passport');




app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// api routes
app.use('/accounts', require('./accounts/accounts.controller'));
app.use('/products', require('./products/products.controller'));
app.use('/pictures', require('./pictures/pictures.controller'));
app.use('/campaigns', require('./campaigns/campaigns.controller'));
app.use('/cashalternatives', require('./cash-alternatives/cash-alternatives.controller'));
app.use('/testimonials', require('./testimonials/testimonials.controller'));
app.use('/winners', require('./winners/winners.controller'));
app.use('/tags', require('./tags/tags.controller'));
app.use('/charitypartners', require('./charitypartners/charitypartners.controller'));
app.use('/coupons', require('./coupons/coupons.controller'));
app.use('/qrcodes', require('./qrcodes/qrcodes.controller'));
app.use('/dreamcoins', require('./dreamcoins/dreamcoins.controller'));
app.use('/recommendations', require('./recommendations/recommendations.controller'));
app.use('/purchases', require('./purchases/purchases.controller'));
app.use('/popups', require('./popups/popups.controller'));
app.use('/callback/google', getGoogleAccountFromCode);
app.use('/callback/google', getFbAccountFromCode);
app.use(passport.initialize());

passport.serializeUser(function(user, cb) {
    cb(null, user);
  });
  
  passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
  });

// swagger docs route
app.use('/api-docs', require('./_helpers/swagger'));

// global error handler
app.use(errorHandler);

// start server
// const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
// app.listen(port, () => { console.log("Started on port " + port); });

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(4080, () => {
  console.log("HTTP server starting on port : " + 4080)
});
httpsServer.listen(4000, () => {
  console.log("HTTP'S' server starting on port : " + 4000)
});

