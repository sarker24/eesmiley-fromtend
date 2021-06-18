'use strict';

const mathUtil = require('../../../src/util/math');
const expect = require('chai').expect;

describe('math-util', () => {
  describe('round', () => {
    it('should round value to default precision of 2', () => {
      const input = 12.666666334;
      const rounded = mathUtil.round(input);
      expect(rounded).to.equal(12.67);
    });

    it('should round value to custom precision', () => {
      const input = 12.666666334;
      const rounded = mathUtil.round(input, 4);
      expect(rounded).to.equal(12.6667);
    });
  });

  describe('changeRatio', () => {
    it('should calculate correct change ratio when next number is bigger', () => {
      const from = 100;
      const to = 150;
      const expectedChange = 0.5;
      const ratio = mathUtil.changeRatio(from, to);
      expect(ratio).to.equal(expectedChange);
    });

    it('should calculate correct change ratio when next number is smaller', () => {
      const from = 125;
      const to = 100;
      const expectedChange = -0.2;
      const ratio = mathUtil.changeRatio(from, to);
      expect(ratio).to.equal(expectedChange);
    });

    it('should calculate correct change ratio when next value is 0', () => {
      const from = 25;
      const to = 0;
      const expectedChange = -1;
      const ratio = mathUtil.changeRatio(from, to);
      expect(ratio).to.equal(expectedChange);
    });

    it('should calculate correct change ratio when original value is 0', () => {
      const from = 0;
      const to = 25;
      const expectedChange = -25;
      const ratio = mathUtil.changeRatio(from, to);
      expect(ratio).to.equal(expectedChange);
    });
  });
});
