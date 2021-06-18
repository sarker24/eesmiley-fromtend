'use strict';

describe('status endpoint', () => {

  it('should check the status (message) of the service', () => {
    return chakram.request('GET', '/status').then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.service).to.equal('service-foodwaste');
      expectChakram(res.body.nodeEnv).to.equal('test');
      expectChakram(res.body.serverTime).to.be.an('number');
    });
  });

});
