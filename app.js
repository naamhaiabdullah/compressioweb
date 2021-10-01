// API dependencies
const routes = require('./src/routes');
const express = require('express');
const app = express();
const cors = require('cors');

// Enabling Cors
app.use(cors({origin:'https://example.com'}));

// Creating Server
app.post('/compress', routes.compress);

// Listenting on Port 3001 for Requests
const server = app.listen(3001);

// Setting Server Timeout 30 secs
server.setTimeout(30 * 1000);
server.keepAliveTimeout = 30 * 1000;
server.headersTimeout = 31 * 1000;