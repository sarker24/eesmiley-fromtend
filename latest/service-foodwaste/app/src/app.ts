import * as path from 'path';
import compress from 'compression';
import cors from 'cors';
import feathers from '@feathersjs/feathers';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';
import * as middleware from './middleware';
import services from './services';

const configuration = require('@feathersjs/configuration');

const app = express(feathers());

app.configure(configuration(path.join(__dirname, '..')));

app.use(compress())
  .options('*', cors())
  .use(cors())
  .use(express.json({ limit: '800kb' }))
  .use(express.urlencoded({ limit: '800kb', extended: true }))
  .configure(express.rest())
  .configure(socketio())
  .configure(middleware.before)
  .configure(services)
  .configure(middleware.after);

export default app;
