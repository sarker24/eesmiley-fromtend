const app = require('../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const responseSchema = schemas.get('template-array-response');

describe('templates endpoint', () => {
  describe('find', () => {

    it('should return valid response', async () => {
      const { body: result } = await chakram.request(
        'GET',
        '/templates',
        { 'headers': { 'Authorization': 'Bearer ' + longLiveAccessToken } }
      );

      await validateSchema(responseSchema, { coerceTypes: true })({ type: 'after', result });
      expectChakram(result).to.deep.equal([{ id: 10000, name: 'test' }]);
    });
  });
});
