'use strict';

const chai = require('chai');
const expect = chai.expect;
const util = require('../../../../src/services/registrations/util/util');

describe('Registrations Service - util', () => {
  it('should return a function that formats by week when period is "week"', () => {
    const periodFormatter = util.getPeriodLabelFormatter('week');

    expect(periodFormatter('2018-09-24')).to.equal('39');
  });

  it('should return a function that formats by month when period is "month"', () => {
    const periodFormatter = util.getPeriodLabelFormatter('month');

    expect(periodFormatter('2018-09-24')).to.equal('2018-09');
  });

  it('should return a function that formats by year when period is "year"', () => {
    const periodFormatter = util.getPeriodLabelFormatter('year');

    expect(periodFormatter('2018-09-24')).to.equal('2018');
  });
});
