const app = require('../../../../src/app').default;
const MetabaseRegistrations = require('../../../../src/services/metabase/registrations').default;
const getMostSpecificPointFilter = require('../../../../src/services/metabase/registrations').getMostSpecificPointFilter;
const jwt = require('jsonwebtoken');

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('Metabase service - metabase/registrations/getMostSpecificPointFilter', () => {
  it('should return empty string when no points selected',  () => {
    const params = {
      query: {
        accounts: 1,
        from: '2017-01-01',
        to: '2017-12-31'
      }
    };

    const result = getMostSpecificPointFilter(params.query);
    expect(result).to.equal('');
  });

  it('should return category ids as most specific',  () => {
    const params = {
      query: {
        accounts: 1,
        from: '2017-01-01',
        to: '2017-12-31',
        category: '1|2'
      }
    };

    const result = getMostSpecificPointFilter(params.query);
    expect(result).to.equal('1|2');
  });

  it('should return category ids as most specific when given also area ids',  () => {
    const params = {
      query: {
        accounts: 1,
        from: '2017-01-01',
        to: '2017-12-31',
        area: '1|2',
        category: '10|20'
      }
    };

    const result = getMostSpecificPointFilter(params.query);
    expect(result).to.equal('10|20');
  });

  it('should return product ids as most specific when given also area and category ids',  () => {
    const params = {
      query: {
        accounts: 1,
        from: '2017-01-01',
        to: '2017-12-31',
        area: '1|2',
        category: '10|20',
        product: '100|200'
      }
    };

    const result = getMostSpecificPointFilter(params.query);
    expect(result).to.equal('100|200');
  });
});

describe('Metabase service - metabase/registrations', () => {
  const sandbox = sinon.createSandbox();
  const service = new MetabaseRegistrations(app);
  const sequelize = app.get('sequelize');
  const token = 'hello-world';
  const secret = 'TOPSECRET';
  const site = 'area51';
  let jwtStub;

  beforeEach(() => {
    jwtStub = sandbox.stub(jwt, 'sign').callsFake((payload, secret) => token);
    sandbox.stub(app, 'get').returns({
      secret,
      maintenance: false,
      site
    })
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should build a url when all params are given', async () => {
    const params = {
      query: {
        accounts: 1,
        from: '2017-01-01',
        to: '2017-12-31',
        area: '1|2|3'
      }
    };

    sandbox.stub(sequelize.models.registration, 'findAll').resolves(['hello']);

    try {
      const result = await service.find(params);
      expect(jwtStub.callCount).to.equal(1);
      expect(jwtStub.firstCall.args[1]).to.equal(secret);
      expect(jwtStub.firstCall.args[0].params).to.deep.equal({
        from: params.query.from,
        to: params.query.to,
        date_group: 'month',
        customer_id: params.query.accounts.toString(),
        point_id_list: params.query.area.split('|').join(',')
      });
      expect(result.url).to.equal(site + '/embed/dashboard/' + token + '#bordered=false&titled=false');
    } catch (err) {
      console.log(err);
      throw err;
    }
  });

  it('should build a url when "accounts" or area,category,product param is not given', async () => {
    const params = {
      query: {
        from: '2017-01-01',
        to: '2017-12-31',
        customerId: 1
      }
    };

    sandbox.stub(sequelize.models.registration, 'findAll').resolves(['hello']);

    try {
      const result = await service.find(params);
      expect(jwtStub.callCount).to.equal(1);
      expect(jwtStub.firstCall.args[1]).to.equal(secret);
      expect(jwtStub.firstCall.args[0].params).to.deep.equal({
        from: params.query.from,
        to: params.query.to,
        date_group: 'month',
        customer_id: params.query.customerId.toString(),
        point_id_list: null
      });
      expect(result.url).to.equal(site + '/embed/dashboard/' + token + '#bordered=false&titled=false');
    } catch (err) {
      console.log(err);
      throw err;
    }
  });
});
