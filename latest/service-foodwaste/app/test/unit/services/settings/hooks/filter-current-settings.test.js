'use strict';

const chai = require('chai')
  , expect = chai.expect
  , filterCurrentSettings = require('../../../../../src/services/settings/hooks/filter-current-settings.js').default
  , app = require('../../../../../src/app').default;

describe('settings service filter-current-settings hook', () => {
  it('should validate that the after-hook filters out the result correctly', (done) => {
    const testResult = [
      {
        "id": "1",
        "customerId": "1",
        "userId": "1",
        "current": {
          "area": "Køkken",
          "cost": 634,
          "date": "2017-01-04",
          "note": "NANANANANANANANANANANANANANA BATMAAAAAAN",
          "unit": "kg",
          "amount": 23,
          "product": "Tomat",
          "currency": "DKK",
          "kgPerLiter": 2,
          "category": "Grønsager"
        },
        "updateTime": "2017-01-09T18:56:03.931Z",
        "createTime": "2017-01-09T18:55:43.405Z",
        "history": {
          "1483988143353": {
            "area": "Køkken",
            "cost": 634,
            "date": "2017-01-04",
            "note": "NANANANANANANANANANANANANANA SPIDERMAAAAN",
            "unit": "kg",
            "amount": 23,
            "product": "Tomat",
            "currency": "DKK",
            "kgPerLiter": 2,
            "category": "Grønsager"
          },
          "1483988152426": {
            "area": "Køkken",
            "cost": 634,
            "date": "2017-01-04",
            "note": "NANANANANANANANANANANANANANA BATMAAAAAAN",
            "unit": "kg",
            "amount": 23,
            "product": "Tomat",
            "currency": "DKK",
            "kgPerLiter": 2,
            "category": "Grønsager"
          }
        },
        "create_time": "2017-01-09T18:55:43.405Z",
        "update_time": "2017-01-09T18:56:03.931Z"
      }
    ];

    const mockHook = {
      type: 'after',
      result: testResult,
    };

    filterCurrentSettings()(mockHook).then((result) => {
      expect(result.result).to.be.an('Object');
      expect(result.result).to.deep.equal(testResult[0].current);

      done();
    }).catch((err) => {
      console.log("ERROR...");
      console.log(err);
    });
  });

  it('should not filter anything and return an empty array as result, as it comes from the service', (done) => {
    const mockHook = {
      type: 'after',
      result: [],
    };

    filterCurrentSettings()(mockHook).then((result) => {
      expect(result.result).to.be.an('Array');
      expect(result.result).to.deep.equal([]);

      done();
    }).catch((err) => {
      console.log("ERROR...");
      console.log(err);
    });
  });

});
