'use strict';

const app = require('../../src/app')
  , Sequelize = app.get('Sequelize')
  , sequelize = app.get('sequelize')
  , models = app.get('models');

module.exports = Object.assign({
  Sequelize,
  sequelize
}, models);
