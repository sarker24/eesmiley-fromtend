const app = require('../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const sinon = require('sinon');

async function createGuestTypes(numOfResource = 1) {
  const result = [];
  for (let i = 0; i < numOfResource; ++i) {
    const response = await chakram.request('POST', '/guest-types', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      body: {
        name: 'resource' + i,
        image: 'http://image.com/image' + i + '.png'
      }
    });
    result.push(response);
  }

  return Promise.all(result);
}

describe('guest-types endpoint', () => {

  describe('create', () => {
    it('should set new guest types as active', async () => {
      const [res] = await createGuestTypes(1);

      expectChakram(res).to.have.status(201);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.active).to.equal(true);
    });

    it('should invalidate when trying to create guest type with active value', async () => {

      const res = await chakram.request('POST', '/guest-types', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          name: 'about to fail',
          active: false
        }
      });

      expectChakram(res).to.have.status(400);
      expectChakram(res.body.errorCode).to.equal('E060');

    });
  });

  describe('patch', () => {
    it('should validate when not toggling off active value', async () => {
      const [{ body: guestType }] = await createGuestTypes(1);

      const res = await chakram.request('PATCH', '/guest-types/' + guestType.id, {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: [
          {
            op: 'replace',
            path: '/name',
            value: 'hello fixed'
          },
          {
            op: 'replace',
            path: '/image',
            value: 'https://image-this.com/image.png'
          }]
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.active).to.equal(true);
      expectChakram(res.body.name).to.equal('hello fixed');
      expectChakram(res.body.image).to.equal('https://image-this.com/image.png');

    });

    it('should validate when toggling off activate state', async () => {
      const [first, second] = await createGuestTypes(2);
      const { body: guestType } = second;

      const res = await chakram.request('PATCH', '/guest-types/' + guestType.id, {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: [
          {
            op: 'replace',
            path: '/active',
            value: false
          }]
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.active).to.equal(false);

    });

    it('should validate when removing image', async () => {
      const [first, second] = await createGuestTypes(2);
      const { body: guestType } = second;

      const res = await chakram.request('PATCH', '/guest-types/' + guestType.id, {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: [
          {
            op: 'replace',
            path: '/image',
            value: null
          }]
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.hasOwnProperty('image')).to.equal(false);

    });

    it('should deactivate the only record when guest types are disabled', async () => {
      const [{ body: guestType }] = await createGuestTypes(1);

      const res = await chakram.request('PATCH', '/guest-types/' + guestType.id, {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: [{
          op: 'replace',
          path: '/active',
          value: false
        }]
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    });

    it('should invalidate when trying to deactivate the only record and guest types are enabled', async () => {
      const [{ body: guestType }] = await createGuestTypes(1);

      await chakram.request('PATCH', '/settings/10000', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: [{
          op: 'replace',
          path: '/current/guestTypes',
          value: { enabled: true, migrationStrategy: { op: "delete" }}
        }]
      });

      const res = await chakram.request('PATCH', '/guest-types/' + guestType.id, {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: [{
          op: 'replace',
          path: '/active',
          value: false
        }]
      });

      expectChakram(res).to.have.status(409);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.errorCode).to.equal('E268');

    });
  });

  describe('find', () => {

    it('should return only active types when given active=true parameter', async () => {
      const createdTypes = await createGuestTypes(4);
      const toBeDeactivated = createdTypes[2].body;
      await chakram.request('PATCH', '/guest-types/' + toBeDeactivated.id, {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: [
          {
            op: 'replace',
            path: '/active',
            value: false
          }]
      });

      const { body: result } = await chakram.request(
        'GET',
        '/guest-types?active=true',
        { 'headers': { 'Authorization': 'Bearer ' + longLiveAccessToken } }
      );

      expectChakram(result.length).to.equal(createdTypes.length - 1);
      expectChakram(result.some(guestType => guestType.id === toBeDeactivated.id)).to.equal(false);

    });
  });

  describe('remove', () => {
    it('should allow remove when multiple active guest types exist', async () => {
      const [{ body: guestType }, second] = await createGuestTypes(2);

      const res = await chakram.request(
        'DELETE',
        '/guest-types/' + guestType.id,
        { 'headers': { 'Authorization': 'Bearer ' + longLiveAccessToken } }
      );

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    });

    it('should allow removing only guest type when guest types are disabled', async () => {
      const [{ body: guestType }] = await createGuestTypes(1);

      const res = await chakram.request(
        'DELETE',
        '/guest-types/' + guestType.id,
        { 'headers': { 'Authorization': 'Bearer ' + longLiveAccessToken } }
      );

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    });

    it('should not allow removing only guest type when guest types are enabled', async () => {
      const [{ body: guestType }] = await createGuestTypes(1);

      await chakram.request('PATCH', '/settings/10000', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: [{
          op: 'replace',
          path: '/current/guestTypes',
          value: { enabled: true, migrationStrategy: { op: "delete" }}
        }]
      });

      const res = await chakram.request(
        'DELETE',
        '/guest-types/' + guestType.id,
        { 'headers': { 'Authorization': 'Bearer ' + longLiveAccessToken } }
      );

      expectChakram(res).to.have.status(409);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.errorCode).to.equal('E268');
    });
  });
});
