const chai = require('chai');
const parseRegistrationPointIds = require('../../../src/hooks/parse-registration-points-params').default;
const expect = chai.expect;

describe('parse-registration-points-params', () => {

  it('should parse area ids as most specific points', async () => {
    const inHook = { params: {query: { area: '1,2,3,4' } } };
    const outHook = await parseRegistrationPointIds()(inHook);
    expect(outHook.params.query.registrationPointIds).to.deep.equal([1,2,3,4]);
  });

  it('should parse category ids as most specific points', async () => {
    const inHook = { params: {query: { area: '1,2,3,4', category: '10,20,30' } } };
    const outHook = await parseRegistrationPointIds()(inHook);
    expect(outHook.params.query.registrationPointIds).to.deep.equal([10,20,30]);
  });

  it('should parse product ids as most specific points', async () => {
    const inHook = { params: {query: { area: '1,2,3,4', category: '10,20,30', product: '100,200' } } };
    const outHook = await parseRegistrationPointIds()(inHook);
    expect(outHook.params.query.registrationPointIds).to.deep.equal([100, 200]);
  });

  it('should parse default points to empty array', async () => {
    const inHook = { params: {query: { } } };
    const outHook = await parseRegistrationPointIds()(inHook);
    expect(outHook.params.query.registrationPointIds).to.deep.equal([]);
  });
});
