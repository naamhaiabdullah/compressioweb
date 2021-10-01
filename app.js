// API dependencies
const routes = require('./src/routes');
const express = require('express');
const app = express();
const cors = require('cors');

// Routing POST Requests on /compress to reqHandCompress
app.post('/compress', cors(), routes.compress);

// Routing All Other Requests to 404 Page
app.use('/', routes.fourofour);

// Listenting on Port 3001
const server = app.listen(3001);

// Setting Server Timeout 30 secs
server.setTimeout(30 * 1000);
server.keepAliveTimeout = 30 * 1000;
server.headersTimeout = 31 * 1000;