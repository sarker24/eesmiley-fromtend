'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE product_ingredient ' +
      'DROP CONSTRAINT IF EXISTS fk_product_ingredient_ingredient_id, ' +
      'ADD CONSTRAINT fk_product_ingredient_ingredient_id ' +
      'FOREIGN KEY (ingredient_id) REFERENCES ingredient(id) ON UPDATE CASCADE')
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE product_ingredient ' +
          'DROP CONSTRAINT IF EXISTS product_ingredient_ingredient_id_fkey'); // this one we only drop and do not recreate because it duplicates the previous FK
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE product_ingredient ' +
          'DROP CONSTRAINT IF EXISTS fk_product_ingredient_product_id, ' +
          'ADD CONSTRAINT fk_product_ingredient_product_id ' +
          'FOREIGN KEY (product_id) REFERENCES product(id) ON UPDATE CASCADE');
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE product_ingredient ' +
          'DROP CONSTRAINT IF EXISTS product_ingredient_product_id_fkey'); // this one we only drop and do not recreate because it duplicates the previous FK
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE project_registration ' +
          'DROP CONSTRAINT IF EXISTS fk_project_registration_project_id, ' +
          'ADD CONSTRAINT fk_project_registration_project_id ' +
          'FOREIGN KEY (project_id) REFERENCES project(id) ON UPDATE CASCADE');
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE project_registration ' +
          'DROP CONSTRAINT IF EXISTS project_registration_project_id_fkey'); // this one we only drop and do not recreate because it duplicates the previous FK
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE project_registration ' +
          'DROP CONSTRAINT IF EXISTS fk_project_registration_registration_id, ' +
          'ADD CONSTRAINT fk_project_registration_registration_id ' +
          'FOREIGN KEY (registration_id) REFERENCES registration(id) ON UPDATE CASCADE');
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE project_registration ' +
          'DROP CONSTRAINT IF EXISTS project_registration_registration_id_fkey'); // this one we only drop and do not recreate because it duplicates the previous FK
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE registration ' +
          'DROP CONSTRAINT IF EXISTS fk_registration_area_area_id, ' +
          'ADD CONSTRAINT fk_registration_area_area_id ' +
          'FOREIGN KEY (area_id) REFERENCES area(id) ON UPDATE CASCADE');
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE registration ' +
          'DROP CONSTRAINT IF EXISTS fk_registration_product_product_id, ' +
          'ADD CONSTRAINT fk_registration_product_product_id ' +
          'FOREIGN KEY (product_id) REFERENCES product(id) ON UPDATE CASCADE');
      });
  },

  down: (queryInterface, Sequelize) => {
    /*
     * Here we don't add back the "_fkey" FKs cuz they are duplicates anyway and we don't need them.
     */
    return queryInterface.sequelize.query('ALTER TABLE product_ingredient ' +
      'DROP CONSTRAINT IF EXISTS fk_product_ingredient_ingredient_id, ' +
      'ADD CONSTRAINT fk_product_ingredient_ingredient_id ' +
      'FOREIGN KEY (ingredient_id) REFERENCES ingredient(id) ON UPDATE CASCADE ON DELETE CASCADE')
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE product_ingredient ' +
          'DROP CONSTRAINT IF EXISTS fk_product_ingredient_product_id, ' +
          'ADD CONSTRAINT fk_product_ingredient_product_id ' +
          'FOREIGN KEY (product_id) REFERENCES product(id) ON UPDATE CASCADE ON DELETE CASCADE');
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE project_registration ' +
          'DROP CONSTRAINT IF EXISTS fk_project_registration_project_id, ' +
          'ADD CONSTRAINT fk_project_registration_project_id ' +
          'FOREIGN KEY (project_id) REFERENCES project(id) ON UPDATE CASCADE ON DELETE CASCADE');
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE project_registration ' +
          'DROP CONSTRAINT IF EXISTS fk_project_registration_registration_id, ' +
          'ADD CONSTRAINT fk_project_registration_registration_id ' +
          'FOREIGN KEY (registration_id) REFERENCES registration(id) ON UPDATE CASCADE ON DELETE CASCADE');
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE registration ' +
          'DROP CONSTRAINT IF EXISTS fk_registration_area_area_id, ' +
          'ADD CONSTRAINT fk_registration_area_area_id ' +
          'FOREIGN KEY (area_id) REFERENCES area(id) ON UPDATE CASCADE ON DELETE CASCADE');
      })
      .then(() => {
        return queryInterface.sequelize.query('ALTER TABLE registration ' +
          'DROP CONSTRAINT IF EXISTS fk_registration_product_product_id, ' +
          'ADD CONSTRAINT fk_registration_product_product_id ' +
          'FOREIGN KEY (product_id) REFERENCES product(id) ON UPDATE CASCADE ON DELETE CASCADE');
      });
  }
};
