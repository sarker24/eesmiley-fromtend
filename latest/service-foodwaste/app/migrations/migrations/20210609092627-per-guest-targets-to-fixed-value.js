'use strict';


module.exports = {
  up: async (queryInterface) => {
    const { sequelize } = queryInterface;
    return sequelize.query("UPDATE settings AS s " +
      "SET current = s.current || jsonb_build_object('perGuestBaseline', " +
      "jsonb_build_array(jsonb_build_object('from', '1970-01-01', 'amount', 110, 'amountNormalized', 110, 'period', 'fixed', 'unit', 'g')));")
      .then(() =>
        sequelize.query("UPDATE settings AS s " +
          "SET current = s.current || jsonb_build_object('perGuestStandard', " +
          "jsonb_build_array(jsonb_build_object('from', '1970-01-01', 'amount', 60, 'amountNormalized', 60, 'period', 'fixed', 'unit', 'g')));"))
      .then(() =>
        sequelize.query("UPDATE settings AS s " +
          "SET current = s.current || jsonb_build_object('expectedFoodwastePerGuest', " +
          "jsonb_build_array(jsonb_build_object('from', '1970-01-01', 'amount', 80, 'amountNormalized', 80, 'period', 'fixed', 'unit', 'g')));"))

  },

  down: async (queryInterface) => {}
};
