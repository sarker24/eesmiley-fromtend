'use strict';

// 2021-05-19 10:46:42
const HISTORY_TIMESTAMP_MS = '1621421175000';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query("UPDATE settings AS s " +
      "SET history = s.history || jsonb_build_object(" +
      `${HISTORY_TIMESTAMP_MS}, s.current);`)
      .then(() =>
        sequelize.query("UPDATE settings AS s " +
          "SET current = s.current || jsonb_build_object('perGuestBaseline', " +
          "jsonb_build_array(jsonb_build_object('from', '1970-01-01', 'amount', 110, 'amountNormalized', 110, 'period', 'day', 'unit', 'g')));"))
      .then(() =>
        sequelize.query("UPDATE settings AS s " +
          "SET current = s.current || jsonb_build_object('perGuestStandard', " +
          "jsonb_build_array(jsonb_build_object('from', '1970-01-01', 'amount', 40, 'amountNormalized', 40, 'period', 'day', 'unit', 'g')));"))
      .then(() =>
        sequelize.query("UPDATE settings AS s " +
          "SET current = s.current || jsonb_build_object('expectedFoodwastePerGuest', " +
          "jsonb_build_array(jsonb_build_object('from', '1970-01-01', 'amount', 60, 'amountNormalized', 60, 'period', 'day', 'unit', 'g')));"))
      .then(() =>
      sequelize.query("UPDATE settings AS s " +
        "SET current = s.current || jsonb_build_object('expectedFrequency', m.result) " +
        "FROM (" +
        "SELECT " +
        "y.customer_id," +
        "jsonb_agg(jsonb_build_object('from', y.date, 'days', y.days) ORDER BY y.date::date ASC) AS result " +
        "FROM (" +
        "SELECT " +
        "x.customer_id," +
        "CASE WHEN x.keys = '0' THEN '1970-01-01' " +
        "ELSE x.keys " +
        "END AS date," +
        "jsonb_extract_path(s.current -> 'registrationsFrequency', x.keys) AS days " +
        "FROM settings s " +
        "JOIN (" +
        "SELECT " +
        "customer_id," +
        "jsonb_object_keys(current -> 'registrationsFrequency') AS keys " +
        "FROM settings " +
        "WHERE " +
        "current -> 'registrationsFrequency' IS NOT NULL " +
        "AND current -> 'registrationsFrequency' <> '{}') AS x ON x.customer_id = s.customer_id) AS y " +
        "GROUP BY " +
        "y.customer_id) AS m " +
        "WHERE " +
        "m.customer_id = s.customer_id;")
      )
      .then(() =>
        sequelize.query("UPDATE settings AS s " +
          "SET current = s.current || jsonb_build_object('expectedFoodwaste', m.result)" +
          "FROM (" +
          "SELECT " +
          "y.customer_id," +
          "jsonb_agg(jsonb_build_object('from', y.date, 'amount', y.expected, 'amountNormalized', y.expected::text::decimal / 7::decimal, 'unit', 'g', 'period', 'week') " +
          "ORDER BY y.date::date ASC) AS result " +
          "FROM (" +
          "SELECT " +
          "x.customer_id," +
          "CASE WHEN x.keys = '0' THEN '1970-01-01' " +
          "ELSE x.keys " +
          "END AS date," +
          "jsonb_extract_path(s.current -> 'expectedWeeklyWaste', x.keys) AS expected " +
          "FROM settings s " +
          "JOIN (" +
          "SELECT " +
          "customer_id," +
          "jsonb_object_keys(current -> 'expectedWeeklyWaste') AS keys " +
          "FROM settings " +
          "WHERE " +
          "current -> 'expectedWeeklyWaste' IS NOT NULL " +
          "AND current -> 'expectedWeeklyWaste' <> '{}') AS x ON x.customer_id = s.customer_id) AS y " +
          "GROUP BY " +
          "y.customer_id) AS m " +
          "WHERE " +
          "m.customer_id = s.customer_id;")
      )

  },

  down: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query(`UPDATE settings set current = jsonb_extract_path(history, ${HISTORY_TIMESTAMP_MS})`);
  }
};
