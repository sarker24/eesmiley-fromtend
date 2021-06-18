/*
 * Init and run ETCD before anything else, in order to setup the env variables first
 */
import { etcdImporter } from 'commons-config-node';

etcdImporter();

/*
 * We initialize the logger before we start the app, so we can log from the very beginning
 */
import * as logger from 'node-logger-esmiley';

const cron = require('node-cron');
const config = require('../config/default.json');
global.log = logger.init(config.serviceName, process.env.LOG_DNA_KEY);

/*
 * IMPORTANT: take care that this import statement is executed after the ectdImporter() and initLogger() since it
 * actually starts the app
 */
import app from './app';

log.debug('*** LAUNCHING...');
const port = app.get('port');
/*
 * First check if all dependencies are live and only then lift the service.
 * Otherwise, exit the process with code 1.
 */
checkDependenciesRunning(app.get('dependencies'));
const server = app.listen(port);

if (process.env.MIGRATION_HOST === 'true') {
  process.env.MIGRATION_STATUS = 'waiting';
}

server.on('listening', async () => {
  log.debug(`*** Service ${app.get('serviceNameHumanReadable')} started on ${app.get('host')}:${port} (exposed ${app.get('portExposed')})`);

  if (process.env.MIGRATION_HOST === 'true') {
    process.env.MIGRATION_STATUS = 'running';

    if (!['rollback', 'migrate'].includes(process.env.MIGRATIONS_ACTION)) {
      log.error({ MIGRATIONS_ACTION: process.env.MIGRATIONS_ACTION },
        'MIGRATIONS_ACTION env var is improperly set! Must be "migrate/rollback" Exiting...');
      process.exit(1);
    }

    log.debug(`*** This is a MIGRATION_HOST. Running migrations with command: ${process.env.MIGRATIONS_ACTION}`);

    await app.get('migrations').execute({ command: process.env.MIGRATIONS_ACTION });
    if (process.env.MIGRATION_STATUS === 'running') {
      process.env.MIGRATION_STATUS = 'finished';
    } else {
      log.warn('Something went wrong with migrations, still in status: ', process.env.MIGRATION_STATUS);
    }
  }

  /*
   * Schedule a cronjob upon service start to execute a job every hour.
   */
  const alarmsJobPattern: string = process.env.ALARMS_JOB_PATTERN ? process.env.ALARMS_JOB_PATTERN : '0 */1 * * *';
  if (process.env.ALARMS_ENABLED === 'true') {
    cron.schedule(alarmsJobPattern, () => {
      app.service('jobs').create({});
    });

    log.info('Alarms enabled');

    if (process.env.ENVIRONMENT !== 'production') {
      log.info({
        env: process.env.ENVIRONMENT
      }, 'This is not Production. Alarms will only be sent for internal test accounts (isTestAccount flag)');
    }
  } else {
    log.info('Alarms NOT enabled.');
  }
});

/**
 *
 * @param {object}  dependencies  The settings object, that contains the check dependencies settings. Looks like this:
 * {
 *    LOG_LIVE: {bool},
 *    REDIS_LIVE: {bool},
 *    SEQUELIZE_LIVE: {bool},
 *    SEQUELIZE_MIGRATION_LIVE: {bool},
 *    MODELS_LIVE: {bool}
 * }
 */
function checkDependenciesRunning(dependencies) {
  if (!dependencies.REDIS_LIVE ||
    !dependencies.SEQUELIZE_LIVE ||
    !dependencies.SEQUELIZE_MIGRATION_LIVE) {
    log.error({ dependencies }, 'WARNING! One or more of the service dependencies are not initialized. Exiting...');
    process.exit(1);
  }
}
