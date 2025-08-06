const express = require('express');
const cors = require('cors');
const indexRoutes = require('./routes/index');

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/', indexRoutes);

module.exports = app; 