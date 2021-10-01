// API dependencies
const routes = require('./routes');
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({origin:'https://example.com'}));

const server = app.listen(3001);

server.setTimeout(30 * 1000);
server.keepAliveTimeout = 30 * 1000;
server.headersTimeout = 31 * 1000;

// Creating Server
app.post('/compress', routes.compress);