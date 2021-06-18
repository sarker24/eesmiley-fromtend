describe('health-check endpoint', () => {

  it('should check the health of the service with all dependencies being healthy', () => {
    return chakram.request('GET', '/health-check').then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.redis).to.equal(true);
      expectChakram(res.body.postgres).to.equal(true);
      // TODO: lift Graylog containers in the Bamboo build plan and uncomment the next line
      // expectChakram(res.body.logServer).to.equal(false);
      expectChakram(res.body.serverTime).to.be.an('number');
    });
  });

});
