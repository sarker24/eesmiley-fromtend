'use strict';

const logger  = require('node-logger-esmiley');
const config = require('../config/default.json');
global.log = logger.init(config.serviceName, process.env.LOG_DNA_KEY);
