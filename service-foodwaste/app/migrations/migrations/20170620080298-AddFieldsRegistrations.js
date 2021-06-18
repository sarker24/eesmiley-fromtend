'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
     * Clause "IF NOT EXISTS" is not supported by Sequelize, so raw sql query is written
     */
    return queryInterface.sequelize.query('ALTER TABLE public.registration ADD COLUMN IF NOT EXISTS manual BOOLEAN DEFAULT true NOT NULL')
      .then(() => {
        queryInterface.sequelize.query('ALTER TABLE public.registration ADD COLUMN IF NOT EXISTS scale CHARACTER VARYING(10)')
      })
      .then(() => {
        queryInterface.sequelize.query('ALTER TABLE public.registration RENAME COLUMN note TO comment')

      })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'registration',
      'manual'
    ).then(() => {
      return queryInterface.removeColumn(
        'registration',
        'scale');
    }).then(() => {
      return queryInterface.renameColumn(
        'registration',
        'comment',
        'note'
      );
    });
  }
};
