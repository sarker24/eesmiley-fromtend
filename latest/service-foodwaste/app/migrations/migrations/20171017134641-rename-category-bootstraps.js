'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
     Add altering commands here.
     Return a promise to correctly handle asynchronicity.

     Example:
     return queryInterface.createTable('users', { id: Sequelize.INTEGER }))
     */

    return queryInterface.sequelize.query('UPDATE public.bootstrap set value=\'{"type": "category", "properties": {"name": "Dairy"}}\', translation_key=\'foodwaste.category.dairy\' WHERE translation_key=\'_foodwaste.product-category.dairy\'')
    .then(() =>  queryInterface.sequelize.query('UPDATE public.bootstrap set value=\'{"type": "category", "properties": {"name": "Animal"}}\', translation_key=\'_foodwaste.category.animal\' WHERE translation_key=\'_foodwaste.product-category.animal\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.bootstrap set value=\'{"type": "category", "properties": {"name": "Starch"}}\', translation_key=\'_foodwaste.category.starch\' WHERE translation_key=\'_foodwaste.product-category.starch\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.bootstrap set value=\'{"type": "category", "properties": {"name": "Fruit/Greens"}}\', translation_key=\'_foodwaste.category.fruit/greens\' WHERE translation_key=\'_foodwaste.product-category.fruit/greens\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.bootstrap set value=\'{"type": "category", "properties": {"name": "Mixed"}}\', translation_key=\'_foodwaste.category.mixed\' WHERE translation_key=\'_foodwaste.product-category.mixed\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.category set bootstrap_key=\'_foodwaste.category.fruit/greens\' WHERE bootstrap_key=\'_foodwaste.product-category.fruit/greens\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.category set bootstrap_key=\'_foodwaste.category.starch\' WHERE bootstrap_key=\'_foodwaste.product-category.starch\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.category set bootstrap_key=\'_foodwaste.category.animal\' WHERE bootstrap_key=\'_foodwaste.product-category.animal\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.category set bootstrap_key=\'_foodwaste.category.mixed\' WHERE bootstrap_key=\'_foodwaste.product-category.mixed\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.category set bootstrap_key=\'_foodwaste.category.dairy\' WHERE bootstrap_key=\'_foodwaste.product-category.dairy\''))

  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('UPDATE public.bootstrap set value=\'{"type": "product-category", "properties": {"name": "Dairy"}}\', translation_key=\'foodwaste.product-category.dairy\' WHERE translation_key=\'_foodwaste.category.dairy\'')
    .then(() =>  queryInterface.sequelize.query('UPDATE public.category set bootstrap_key=\'_foodwaste.product-category.dairy\' WHERE bootstrap_key=\'_foodwaste.category.dairy\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.bootstrap set value=\'{"type": "product-category", "properties": {"name": "Animal"}}\', translation_key=\'_foodwaste.product-category.animal\' WHERE translation_key=\'_foodwaste.category.animal\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.category set bootstrap_key=\'_foodwaste.product-category.animal\' WHERE bootstrap_key=\'_foodwaste.category.animal\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.bootstrap set value=\'{"type": "product-category", "properties": {"name": "Starch"}}\', translation_key=\'_foodwaste.product-category.starch\' WHERE translation_key=\'_foodwaste.category.starch\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.category set bootstrap_key=\'_foodwaste.product-category.starch\' WHERE bootstrap_key=\'_foodwaste.category.starch\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.bootstrap set value=\'{"type": "product-category", "properties": {"name": "Fruit/Greens"}}\', translation_key=\'_foodwaste.product-category.fruit/greens\' WHERE translation_key=\'_foodwaste.category.fruit/greens\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.category set bootstrap_key=\'_foodwaste.product-category.fruit/greens\' WHERE bootstrap_key=\'_foodwaste.category.fruit/greens\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.bootstrap set value=\'{"type": "product-category", "properties": {"name": "Mixed"}}\', translation_key=\'_foodwaste.product-category.mixed\' WHERE translation_key=\'_foodwaste.category.mixed\''))
    .then(() =>  queryInterface.sequelize.query('UPDATE public.category set bootstrap_key=\'_foodwaste.product-category.mixed\' WHERE bootstrap_key=\'_foodwaste.produ-category.mixed\''))
  }
};
