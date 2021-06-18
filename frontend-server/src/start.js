#!/usr/bin/env node

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 80;

const etcdImporter = require('commons-config-node').etcdImporter;
const logger = require('node-logger-esmiley');

/*
 * Load the environment variables from Etcd into local env vars
 */
process.env.SERVICE_NAME = 'frontend-server';
etcdImporter();

global.log = logger.init(process.env.SERVICE_NAME, process.env.LOG_DNA_KEY);

app.use(express.static('dist'))
  .use(bodyParser.json());

app.get('/ping', (req, res) => {
  res.status(418);
  res.set('Content-Type', 'application/json');
  res.send({
    'message': 'pong',
    'serverTime': now()
  });
});

app.get('/health-check', (req, res) => {
  res.set('Content-Type', 'application/json');
  res.send({
    'status': 'ok',
    'serverTime': now()
  });
});

app.get('/status', (req, res) => {
  res.set('Content-Type', 'application/json');
  res.send({
    'status': 'running',
    'tag': process.env.BUILD_TAG,
    'hash': process.env.BUILD_HASH,
    'branch': process.env.BUILD_BRANCH,
    'hostname': process.env.HOSTNAME,
    'service': 'frontend-server',
    'nodeEnv': process.env.NODE_ENV,
    'environment': process.env.ENVIRONMENT,
    'serverTime': now()
  });
});

app.post('/log', (req, res) => {
  if (!req.body.level || !['fatal', 'error', 'warn', 'info', 'debug'].includes(req.body.level)) {
    log.error({ attemptLogObject: req.body }, 'Attempted to log with a wrong log format');
  } else {
    log[req.body.level](req.body.logData, req.body.logMessage);
  }

  res.status(200);
  res.send({});
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve('./dist/index.html'));
});

app.listen(port, () => {
  log.info(`*** Service ${process.env.SERVICE_NAME} started on port ${port} (container exposed: ${process.env.EXPOSED_PORT})...`);
});

function now() {
  return Math.floor(new Date().getTime() / 1000);
}
