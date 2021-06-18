'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("CREATE TYPE project_status_type_new AS ENUM ('PENDING_START', 'RUNNING', 'PENDING_INPUT', 'PENDING_FOLLOWUP', 'RUNNING_FOLLOWUP', 'ON_HOLD','FINISHED')")
      .then(() => queryInterface.sequelize.query("ALTER TABLE public.project ALTER COLUMN status TYPE VARCHAR(50) USING status::text"))
      .then(() => queryInterface.sequelize.query("ALTER TABLE public.project ALTER COLUMN status DROP DEFAULT"))
      .then(() => queryInterface.sequelize.query("UPDATE project SET status = 'PENDING_INPUT' WHERE status = 'AWAITING_ACTION'"))
      .then(() => queryInterface.sequelize.query("ALTER TABLE public.project ALTER COLUMN status TYPE project_status_type_new USING status::project_status_type_new"))
      .then(() => queryInterface.sequelize.query("ALTER TABLE public.project ALTER COLUMN status SET DEFAULT 'PENDING_START'::project_status_type_new"))
      .then(() => queryInterface.sequelize.query("DROP TYPE public.project_status_type"))
      .then(() => queryInterface.sequelize.query("ALTER TYPE project_status_type_new RENAME TO project_status_type"))
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("CREATE TYPE project_status_type_new AS ENUM ('PENDING_START','PENDING_FOLLOWUP','RUNNING''AWAITING_ACTION','FINISHED')")
      .then(() => queryInterface.sequelize.query("ALTER TABLE public.project ALTER COLUMN status TYPE VARCHAR(50) USING status::text"))
      .then(() => queryInterface.sequelize.query("ALTER TABLE public.project ALTER COLUMN status DROP DEFAULT"))
      .then(() => queryInterface.sequelize.query("UPDATE project SET status = 'AWAITING_ACTION' WHERE status = 'PENDING_INPUT'"))
      .then(() => queryInterface.sequelize.query("ALTER TABLE public.project ALTER COLUMN status TYPE project_status_type_new USING status::project_status_type_new"))
      .then(() => queryInterface.sequelize.query("ALTER TABLE public.project ALTER COLUMN status SET DEFAULT 'PENDING_START'::project_status_type_new"))
      .then(() => queryInterface.sequelize.query("DROP TYPE public.project_status_type"))
      .then(() => queryInterface.sequelize.query("ALTER TYPE project_status_type_new RENAME TO project_status_type"))  }
};
