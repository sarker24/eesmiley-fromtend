'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.area ALTER COLUMN image TYPE VARCHAR(255) USING image::VARCHAR;')
    .then(() => queryInterface.sequelize.query('ALTER TABLE public.area ALTER COLUMN image TYPE JSONB USING image::text::jsonb;'));
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('ALTER TABLE public.area ALTER COLUMN image TYPE BYTEA USING image::bytea;');
  }
};
