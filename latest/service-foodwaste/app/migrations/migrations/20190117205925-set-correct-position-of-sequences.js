'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;
    let ingredientSeqNumber, productSeqNumber;

    return Promise.all([
      sequelize.query('SELECT id FROM ingredient_old ORDER BY id DESC LIMIT 1',
        { type: sequelize.QueryTypes.SELECT }),
      sequelize.query('SELECT id FROM product_old ORDER BY id DESC LIMIT 1',
        { type: sequelize.QueryTypes.SELECT })
    ])
      .then(result => {
        /*
         * `result` will be smth like:  [ [ { id: '197' } ], [ { id: '4948' } ] ]
         *
         * We have to increment the sequences, so that they start from the next available ID number
         */
        ingredientSeqNumber = +result[0][0].id + 1;
        productSeqNumber = +result[1][0].id + 1;
      })
      .then(() => {
        return sequelize.query('ALTER SEQUENCE ingredient_old_id_seq RESTART WITH :ingredientSeqNumber', {
          replacements: { ingredientSeqNumber },
          type: sequelize.QueryTypes.UPDATE
        })
      })
      .then(() => {
        return sequelize.query('ALTER SEQUENCE product_old_id_seq RESTART WITH :productSeqNumber', {
          replacements: { productSeqNumber },
          type: sequelize.QueryTypes.UPDATE
        })
      })
      .then(sequelize.query(
        "ALTER TABLE ingredient_old ALTER COLUMN id SET DEFAULT nextval('ingredient_old_id_seq'::regclass)"
      ))
      .then(sequelize.query(
        "ALTER TABLE product_old ALTER COLUMN id SET DEFAULT nextval('product_old_id_seq'::regclass)"
      ));
  },

  down: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;
    let ingredientSeqNumber, productSeqNumber;

    return Promise.all([
      sequelize.query('SELECT id FROM ingredient_old ORDER BY id DESC LIMIT 1',
        { type: sequelize.QueryTypes.SELECT }),
      sequelize.query('SELECT id FROM product_old ORDER BY id DESC LIMIT 1',
        { type: sequelize.QueryTypes.SELECT })
    ])
      .then(result => {
        /*
         * `result` will be smth like:  [ [ { id: '197' } ], [ { id: '4948' } ] ]
         *
         * We have to increment the sequences, so that they start from the next available ID number
         */
        ingredientSeqNumber = +result[0][0].id + 1;
        productSeqNumber = +result[1][0].id + 1;
      })
      .then(() => {
        return sequelize.query('ALTER SEQUENCE ingredient_id_seq RESTART WITH :ingredientSeqNumber', {
          replacements: { ingredientSeqNumber },
          type: sequelize.QueryTypes.UPDATE
        })
      })
      .then(() => {
        return sequelize.query('ALTER SEQUENCE product_id_seq RESTART WITH :productSeqNumber', {
          replacements: { productSeqNumber },
          type: sequelize.QueryTypes.UPDATE
        })
      })
      .then(sequelize.query(
        "ALTER TABLE ingredient_old ALTER COLUMN id SET DEFAULT nextval('ingredient_id_seq'::regclass)"
      ))
      .then(sequelize.query(
        "ALTER TABLE product_old ALTER COLUMN id SET DEFAULT nextval('product_id_seq'::regclass)"
      ));
  }
};
