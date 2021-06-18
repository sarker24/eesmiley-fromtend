'use strict';

const targetBucket = require('../../../../../src/services/targets/util/target-bucket');
const expect = require('chai').expect;

describe('target-bucket', () => {
  describe('getTargetBuckets', () => {
    it('should parse correct target ranges when only 1 target exists', () => {
      const targetSettings = [{
        from: '1970-01-01', amount: 1000, unit: 'g', period: 'week', amountNormalized: 1000 / 7
      }];

      const timeRange = { from: '2008-01-01', to: '2012-12-12' };
      const targetBuckets = targetBucket.getTargetBuckets(targetSettings, timeRange);
      expect(targetBuckets).to.deep.equal([{
        ...targetSettings[0],
        from: '2008-01-01',
        to: '2012-12-12'
      }]);
    });

    it('should parse correct target ranges when multiple targets exist', () => {
      const targetSettings = [
        { from: '1970-01-01', amount: 1000, unit: 'g', period: 'week', amountNormalized: 1000 / 7 },
        { from: '2009-01-01', amount: 2000, unit: 'g', period: 'week', amountNormalized: 2000 / 7 },
        { from: '2010-10-10', amount: 3000, unit: 'g', period: 'week', amountNormalized: 3000 / 7 }
      ];

      const timeRange = { from: '2008-01-01', to: '2010-01-12' };
      const targetBuckets = targetBucket.getTargetBuckets(targetSettings, timeRange);
      expect(targetBuckets).to.deep.equal([
        {
          ...targetSettings[0],
          from: '2008-01-01',
          to: '2008-12-31',
        },
        {
          ...targetSettings[1],
          from: '2009-01-01',
          to: '2010-01-12',
        }
      ]);
    });

    it('should parse correct target ranges when multiple targets exist with open end', () => {
      const targetSettings = [
        { from: '1970-01-01', amount: 1000, unit: 'g', period: 'week', amountNormalized: 1000 / 7 },
        { from: '2009-01-01', amount: 2000, unit: 'g', period: 'week', amountNormalized: 2000 / 7 },
        { from: '2010-10-10', amount: 3000, unit: 'g', period: 'week', amountNormalized: 3000 / 7 }
      ];

      const timeRange = { from: '2008-01-01', to: '2012-12-12' };
      const targetBuckets = targetBucket.getTargetBuckets(targetSettings, timeRange);
      expect(targetBuckets).to.deep.equal([
        {
          ...targetSettings[0],
          from: '2008-01-01',
          to: '2008-12-31'
        },
        {
          ...targetSettings[1],
          from: '2009-01-01',
          to: '2010-10-09'
        },
        {
          ...targetSettings[2],
          from: '2010-10-10',
          to: '2012-12-12'
        }
      ]);
    });

    it('should parse correct target ranges when multiple targets exist with start as open end', () => {
      const targetSettings = [
        { from: '1970-01-01', amount: 1000, unit: 'g', period: 'week', amountNormalized: 1000 / 7 },
        { from: '2009-01-01', amount: 2000, unit: 'g', period: 'week', amountNormalized: 2000 / 7 },
        { from: '2010-10-10', amount: 3000, unit: 'g', period: 'week', amountNormalized: 3000 / 7 }
      ];
      const timeRange = { from: '2015-01-01', to: '2018-12-12' };
      const targetBuckets = targetBucket.getTargetBuckets(targetSettings, timeRange);
      expect(targetBuckets).to.deep.equal([
        {
          ...targetSettings[2],
          from: '2015-01-01',
          to: '2018-12-12'
        },
      ]);
    });

    it('should parse correct target ranges when multiple targets exist with end date overlapping', () => {
      const targetSettings = [
        { from: '1970-01-01', amount: 1000, unit: 'g', period: 'week', amountNormalized: 1000 / 7 },
        { from: '2009-01-01', amount: 2000, unit: 'g', period: 'week', amountNormalized: 2000 / 7 },
        { from: '2010-10-10', amount: 3000, unit: 'g', period: 'week', amountNormalized: 3000 / 7 }
      ];
      const timeRange = { from: '2008-01-01', to: '2009-01-01' };
      const targetBuckets = targetBucket.getTargetBuckets(targetSettings, timeRange);
      expect(targetBuckets).to.deep.equal([
        {
          ...targetSettings[0],
          from: '2008-01-01',
          to: '2008-12-31'
        },
        {
          ...targetSettings[1],
          from: '2009-01-01',
          to: '2009-01-01'
        }
      ]);
    });

    it('should parse correct target ranges when multiple targets exist with start date overlapping', () => {
      const targetSettings = [
        { from: '1970-01-01', amount: 1000, unit: 'g', period: 'week', amountNormalized: 1000 / 7 },
        { from: '2009-01-01', amount: 2000, unit: 'g', period: 'week', amountNormalized: 2000 / 7 },
        { from: '2010-10-10', amount: 3000, unit: 'g', period: 'week', amountNormalized: 3000 / 7 }
      ];
      const timeRange = { from: '2009-01-01', to: '2010-01-01' };
      const targetBuckets = targetBucket.getTargetBuckets(targetSettings, timeRange);
      expect(targetBuckets).to.deep.equal([
        {
          ...targetSettings[1],
          from: '2009-01-01',
          to: '2010-01-01'
        }
      ]);
    });
  });
});
