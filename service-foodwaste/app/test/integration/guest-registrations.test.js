const app = require('../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const sinon = require('sinon');

describe('guest-registrations endpoint', () => {

  describe('create', () => {
    it('should create new registration with guest type', async () => {

      const { body: guestType } = await chakram.request('POST', '/guest-types', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          name: 'this is a guest type',
          image: 'https://images.com/everywhere.png'
        }
      });

      const res = await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-12-31',
          amount: 120,
          guestTypeId: guestType.id
        }
      });

      expectChakram(res).to.have.status(201);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.hasOwnProperty('id')).to.equal(true);
      expectChakram(res.body.date).to.equal('2019-12-31');
      expectChakram(res.body.amount).to.equal(120);
      expectChakram(res.body.hasOwnProperty('guestTypeId')).to.equal(false);
      expectChakram(res.body.hasOwnProperty('guestType')).to.equal(true);
      expectChakram(res.body.guestType.id).to.equal(guestType.id);
      expectChakram(res.body.guestType.image).to.equal(guestType.image);

    });

    it('should create new registration without guest type when guest type enabled flag doesnt exist', async () => {
      const res = await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-12-31',
          amount: 120,
          guestTypeId: null
        }
      });

      expectChakram(res).to.have.status(201);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.hasOwnProperty('id')).to.equal(true);
      expectChakram(res.body.date).to.equal('2019-12-31');
      expectChakram(res.body.amount).to.equal(120);
      expectChakram(res.body.hasOwnProperty('guestType')).to.equal(false);
    });

    it('should create new registration without guest type when guest types are disabled', async () => {
      await chakram.request('PATCH', '/settings/10000', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: [{
          op: 'add',
          path: '/current/enableGuestTypes',
          value: false
        }]
      });

      const res = await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-12-31',
          amount: 120
        }
      });

      expectChakram(res).to.have.status(201);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.hasOwnProperty('id')).to.equal(true);
      expectChakram(res.body.date).to.equal('2019-12-31');
      expectChakram(res.body.amount).to.equal(120);
      expectChakram(res.body.hasOwnProperty('guestType')).to.equal(false);

    });

    it('should throw error when guest type is not given and guest types are enabled', async () => {
      const { body: guestType } = await chakram.request('POST', '/guest-types', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          name: 'this is a guest type',
          image: 'https://images.com/everywhere.png'
        }
      });

      const res0 = await chakram.request('PATCH', '/settings/10000', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: [{
          op: 'add',
          path: '/current/enableGuestTypes',
          value: true
        }]
      });

      const res = await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-12-31',
          amount: 120
        }
      });

      expectChakram(res).to.have.status(500);
      expectChakram(res.body.errorCode).to.equal('E270');

    });

    it('should return error when guest type doesnt exist', async () => {
      const res = await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-12-31',
          amount: 120,
          guestTypeId: 66007
        }
      });

      expectChakram(res).to.have.status(500);
      expectChakram(res.body.errorCode).to.equal('E269');
    });

    it('should soft delete old guest registration with same date and guest type', async () => {
      const { body: oldGuestRegistration } = await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-12-31',
          amount: 120
        }
      });

      const { body: newGuestRegistration } = await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-12-31',
          amount: 200
        }
      });

      const { body: deletedOldGuestRegistration } = await chakram.request('GET', '/guest-registrations/' + oldGuestRegistration.id + '/?includeSoftDeleted=true', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
      });

      expectChakram(newGuestRegistration.hasOwnProperty('deletedAt')).to.equal(false);
      expectChakram(deletedOldGuestRegistration.id).to.equal(oldGuestRegistration.id);
      expectChakram(deletedOldGuestRegistration.hasOwnProperty('deletedAt')).to.equal(true);
    });

  });

  describe('patch', () => {
    it('should return correct response when changing amount', async () => {
      const { body: guestType } = await chakram.request('POST', '/guest-types', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          name: 'this is a guest type',
          image: 'https://images.com/everywhere.png'
        }
      });

      const { body: registration } = await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-12-31',
          amount: 120,
          guestTypeId: guestType.id
        }
      });

      const res = await chakram.request('PATCH', '/guest-registrations/' + registration.id, {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: [{
          op: 'replace',
          path: '/amount',
          value: 1200
        }]
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.amount).to.equal(1200);
      expectChakram(res.body.hasOwnProperty('guestTypeId')).to.equal(false);
      expectChakram(res.body.hasOwnProperty('guestType')).to.equal(true);
      expectChakram(res.body.guestType.id).to.equal(guestType.id);
      expectChakram(res.body.guestType.image).to.equal(guestType.image);

    });
  });

  describe('find', () => {
    it('should return all registrations', async () => {
      const res = await chakram.request('GET', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(0);

    });

    it('should return registrations within given interval', async () => {
      const { body: guestType } = await chakram.request('POST', '/guest-types', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          name: 'this is a guest type',
          image: 'https://images.com/everywhere.png'
        }
      });

      await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-01-01',
          amount: 120
        }
      });

      await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-02-02',
          amount: 120,
          guestTypeId: guestType.id
        }
      });

      await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-03-03',
          amount: 120
        }
      });

      const res = await chakram.request('GET', '/guest-registrations?startDate=2019-01-01&endDate=2019-02-02', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(2);

    });

    it('should return registrations by given date when also start and end parameters exist', async () => {

      await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-01-01',
          amount: 120
        }
      });

      await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-02-02',
          amount: 120
        }
      });

      await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-03-03',
          amount: 120
        }
      });

      const res = await chakram.request('GET', '/guest-registrations?startDate=2019-01-01&endDate=2019-02-02&date=2019-03-03', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(1);
      expectChakram(res.body[0].date).to.equal('2019-03-03');

    });

    it('should soft delete old registration with same date and type', async () => {

      const { body: guestType0 } = await chakram.request('POST', '/guest-types', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          name: 'this is a guest type 0',
          image: 'https://images.com/everywhere0.png'
        }
      });

      const { body: guestType1 } = await chakram.request('POST', '/guest-types', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          name: 'this is a guest type 1',
          image: 'https://images.com/everywhere1.png'
        }
      });

      const { body: toBeSoftDeleted } = await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-12-31',
          amount: 120,
          guestTypeId: guestType0.id
        }
      });

      await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-12-31',
          amount: 1200,
          guestTypeId: guestType0.id
        }
      });

      await chakram.request('POST', '/guest-registrations', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        },
        body: {
          date: '2019-12-31',
          amount: 999,
          guestTypeId: guestType1.id
        }
      });

      const onDateResult = await chakram.request('GET', '/guest-registrations?date=2019-12-31', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(onDateResult).to.have.status(200);
      expectChakram(onDateResult).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(onDateResult.body.length).to.equal(2);
      expectChakram(onDateResult.body.some(reg => reg.id === toBeSoftDeleted.id)).to.equal(false);
      expectChakram(onDateResult.body.every(reg => reg.date === '2019-12-31')).to.equal(true);

    });
  });

});
