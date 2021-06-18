'use strict';


module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    const { sequelize } = queryInterface;
    return sequelize.query("CREATE OR REPLACE FUNCTION bootstrap_from_template (template_account_id BIGINT, customer_ids BIGINT[], delete_old BOOLEAN DEFAULT FALSE)" +
      "  RETURNS VOID" +
      "  AS $$" +
      "DECLARE" +
      "  err_context text;" +
      "  current_customer_id BIGINT;" +
      "  num_of_levels INT;" +
      "  num_of_points INT;" +
      "  current_level INT;" +
      "  esmiley_id CONSTANT BIGINT := 1;" +
      "BEGIN" +
      "  SELECT" +
      "    count(*)," +
      "    coalesce(max(NLEVEL (path)), 0) INTO num_of_points," +
      "    num_of_levels" +
      "  FROM" +
      "    registration_point" +
      "  WHERE" +
      "    deleted_at IS NULL" +
      "    AND customer_id = template_account_id;" +
      "  IF (num_of_points = 0) THEN" +
      "    RAISE NOTICE 'Template account % does not have any active registration points...exiting', template_account_id;" +
      "    RETURN;" +
      "  END IF;" +
      "  IF (delete_old) THEN" +
      "    RAISE NOTICE 'Received delete_old flag set true - Soft deleting old registration points...';" +
      "    UPDATE" +
      "      registration_point" +
      "    SET" +
      "      deleted_at = now()" +
      "    WHERE" +
      "      customer_id = ANY (customer_ids);" +
      "    RAISE NOTICE 'Deleted old registration points';" +
      "  END IF;" +
      "  FOREACH current_customer_id IN ARRAY customer_ids LOOP" +
      "    RAISE NOTICE 'Copying data from template account % to account %...', template_account_id, current_customer_id;" +
      "    FOR current_level IN 0..num_of_levels LOOP" +
      "      IF (current_level = 0) THEN" +
      "        INSERT INTO registration_point (parent_id, path, bootstrap_key, user_id, customer_id, name," +
      "          COST, cost_per_kg, image, active, amount, label) (" +
      "          SELECT" +
      "            NULL," +
      "            NULL," +
      "            id," +
      "            esmiley_id," +
      "            current_customer_id," +
      "            name," +
      "            COST," +
      "            cost_per_kg," +
      "            image," +
      "            active," +
      "            amount," +
      "            label" +
      "          FROM" +
      "            registration_point" +
      "          WHERE" +
      "            deleted_at IS NULL" +
      "            AND path IS NULL" +
      "            AND customer_id = template_account_id);" +
      "      ELSE" +
      "        INSERT INTO registration_point (parent_id, path, bootstrap_key, user_id, customer_id, name," +
      "          COST, cost_per_kg, image, active, amount, label) (" +
      "          SELECT" +
      "            parent.id," +
      "            CASE" +
      "              WHEN parent.path IS NULL THEN (parent.id::text)::LTREE" +
      "              ELSE CONCAT(parent.path, '.', parent.id::text)::LTREE" +
      "            END," +
      "            p.id," +
      "            esmiley_id," +
      "            current_customer_id," +
      "            p.name," +
      "            p.cost," +
      "            p.cost_per_kg," +
      "            p.image," +
      "            p.active," +
      "            p.amount," +
      "            p.label" +
      "          FROM" +
      "            registration_point p" +
      "            JOIN registration_point parent ON p.parent_id = parent.bootstrap_key::bigint" +
      "          WHERE" +
      "            p.deleted_at IS NULL" +
      "            AND parent.deleted_at IS NULL" +
      "            AND NLEVEL (p.path) = current_level" +
      "            AND p.customer_id = template_account_id" +
      "            AND parent.customer_id = current_customer_id" +
      "            AND parent.bootstrap_key ~ '^[0-9]+$');" +
      "      END IF;" +
      "    END LOOP;" +
      "  END LOOP;" +
      "  RAISE NOTICE 'Successfully copied template data';" +
      "EXCEPTION" +
      "  WHEN OTHERS THEN" +
      "    GET STACKED DIAGNOSTICS err_context = PG_EXCEPTION_CONTEXT;" +
      "  RAISE NOTICE 'Could not complete copying...rolled back data';" +
      "  RAISE INFO 'Error Name:%', SQLERRM;" +
      "  RAISE INFO 'Error State:%', SQLSTATE;" +
      "  RAISE INFO 'Error Context:%', err_context;" +
      "END;" +
      "" +
      "$$" +
      "LANGUAGE plpgsql;");
  },

  down: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.query('DROP FUNCTION IF EXISTS bootstrap_from_template(BIGINT,BIGINT[],BOOLEAN);');
  }
};
