'use strict';

const logger = require('node-logger-esmiley');
const config = require('../config/default.json');
global.log = logger.init(config.serviceName, process.env.LOG_DNA_KEY);

const app = require('../src/app.js').default;
const chakram = require('chakram');

const longLiveAccessToken = app.get('testLongLivedAccessToken');
const sequelizeMigration = app.get('sequelizeMigration');
const sequelize = app.get('sequelize');
const models = sequelize.models;
const redis = app.get('redisClient');
const fixtures = require('./fixtures/models');
const redisData = require('./fixtures/redis-data');
const sequences = [];
const sinon = require('sinon');
const common = require('feathers-commons-esmiley');

const sandbox = sinon.createSandbox();

before((done) => {
  /*
   * Set up Chakram
   */
  chakram.setRequestDefaults({
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + longLiveAccessToken
    }
  });

  chakram._request = chakram.request.bind({});
  chakram.request = (method, url, options) => {

    if (url.length > 0 && url[0] === '/') {
      url = `http://${app.get('host')}:${app.get('port')}` + url;
    }

    return chakram._request(method, url, options);
  };
  global.chakram = chakram;
  global.expectChakram = chakram.expect;

  /*
   * Start the server
   */
  const port = app.get('port');
  const server = app.listen(port);

  log.debug({}, 'Testing debug log - do not remove me!');

  server.on('listening', () => {
    console.log(`Service ${app.get('serviceNameHumanReadable')} started on ${app.get('host')}:${port} (exposed ${app.get('portExposed')})`);

    console.log('*** INFO: Executing Migrations...');
    return app.get('migrations').execute({ command: 'migrate' })
      .then(() => {
        console.log('*** INFO: Migrations executed successfully!');
      })
      .then(() => {
        return sequelize.query('SELECT relname AS sequence FROM pg_class WHERE relkind = \'S\' and relname != \'_migrations_id_seq\'', {
          type: sequelize.QueryTypes.SELECT
        });
      })
      .then(seqList => {
        seqList.forEach(({ sequence }) => sequences.push(sequence));
        done();
      });
  });
});

afterEach(() => {
  sandbox.restore();
});

beforeEach(async () => {
  try {
    // default mock instead of stubbing in every test file
    // todo properly later on
    global.makeHttpRequestMock = sandbox.stub(common, 'makeHttpRequest').callsFake(() => Promise.resolve({
      current: {
        dealId: "1",
        company: 'heroes of the universe',
        nickname: 'he the man',
        name: 'he-man'
      },
      children: []
    }))
    /*
     * Clear Redis
     */
    await redis.flushdbAsync();
    /*
     * Clear PG
     */
    await models.tip.destroy({ force: true, where: {} });
    await models.settings.destroy({ force: true, where: {} });
    await models.project_registration.destroy({ force: true, where: {} });
    await models.action.destroy({ force: true, where: {} });
    await models.registration.destroy({ force: true, where: {} });
    await models.ingredient.destroy({ force: true, where: {} });
    await sequelize.query('DELETE FROM registration_point where id in (select id from registration_point order by nlevel(path) DESC NULLS LAST)')
    await models.project.destroy({ force: true, where: {} });
    await models.sale.destroy({ force: true, where: {} });
    await models.settings.destroy({ force: true, where: {} });
    await models.guest_registration.destroy({ force: true, where: {} });
    await models.guest_type.destroy({ force: true, where: {} });
    await models.template.destroy({ force: true, where: {} });
    await resetSequences();

    /*
     * Repopulate Redis
     */
    await redis.setAsync(`status:${app.get('redisKey')}`, redisData.status);
    /*
     * Repopulate PG
     */
    await models.action.bulkCreate(fixtures.action);
    await models.registration_point.bulkCreate(fixtures.area);
    await models.registration_point.bulkCreate(fixtures.category);
    await models.registration_point.bulkCreate(fixtures.product);
    await models.sale.bulkCreate(fixtures.sale);
    // bulk insert projects only first to maintain the fixed parentId relations
    const projects = await models.project.bulkCreate(fixtures.project.map(({
                                                                             registrationPoints,
                                                                             ...project
                                                                           }) => project), { returning: true });
    const projRegPromises = [];
    projects.forEach((project, index) => {
      const { registrationPoints } = fixtures.project[index];
      const prom = models.project_registration_point.bulkCreate(
        registrationPoints.map(point => ({
          project_id: project.id,
          registration_point_id: point.id,
          include_children: point.includeChildren
        })));
      projRegPromises.push(prom);
    });

    await Promise.all(projRegPromises);
    await models.settings.bulkCreate(fixtures.settings);
    await models.tip.bulkCreate(fixtures.tip);
    await models.registration.bulkCreate(fixtures.registration);
    await models.project_registration.bulkCreate(fixtures.project_registration);
    await models.guest_type.bulkCreate(fixtures.guestTypes);
    await models.guest_registration.bulkCreate(fixtures.guestRegistrations);
    await models.template.bulkCreate(fixtures.templates);
  } catch (err) {
    console.log();
    console.log('===============////////// ERROR RESETTING DATA IN THE TABLES //////////===============');
    console.log();
    console.log(err);
    console.log(err.message);
    console.log(err.original.message);
    console.log(err.original.detail);
  }
});

/**
 * Runs queries to reset the sequences in the DB to 10000
 *
 * Probably outdated doc, I cant find anything about this issue in sequelize docs:
 * (just to be sure - we put a high enough value), so that there
 * are no conflicts after the `bulkCreate` executions, because `bulkCreate` does not trigger the sequence index.
 *
 */
async function resetSequences() {
  const subPromises = [];

  try {
    for (const seq of sequences) {
      const restartQuery = `ALTER SEQUENCE ${seq} RESTART WITH 10000;`;
      subPromises.push(sequelizeMigration.query(restartQuery));
    }
    return await Promise.all(subPromises);
  } catch (err) {
    console.log(err.message);
  }
}
