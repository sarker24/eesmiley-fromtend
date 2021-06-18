const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const parseParametersHook = require('../../../../../src/services/guest-registrations/hooks/parse-query-parameters').default;
const expect = chai.expect;

describe('parse-query-parameters', () => {
  let inHook;

  beforeEach(() => {
    inHook = {
      params: {
        query: {
          date: '2019-01-01'
        }
      }
    };
  });

  it('should pass date parameter', async () => {
    const outHook = await parseParametersHook()(inHook);
    expect(outHook.params.query.date).to.equal('2019-01-01');
  });

  it('should filter out less specific start and end parameters if date is present', async () => {
    inHook.params.query.startDate = '2019-01-01';
    const outHook = await parseParametersHook()(inHook);
    expect(outHook.params.query.date).to.equal('2019-01-01');
    expect(outHook.params.query.hasOwnProperty('startDate')).to.equal(false);

  });

  it('should transform startDate and endDate parameters', async () => {
    delete inHook.params.query.date;
    inHook.params.query.startDate = '2019-01-01';
    inHook.params.query.endDate = '2019-02-01';

    const outHook = await parseParametersHook()(inHook);
    expect(outHook.params.query.date).to.deep.equal({
      $gte: '2019-01-01',
      $lte: '2019-02-01'
    });
  });

});
