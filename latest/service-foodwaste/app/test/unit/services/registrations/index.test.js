'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const sinon = require('sinon');
const app = require('../../../../src/app').default;
const validateSchema = require('feathers-hooks-esmiley').validateSchema;

const schemas = require('schemas');
const findRequestSchema = schemas.get('registration-find-request.json');
const createRequestSchema = schemas.get('registration-create-request.json');

const longLiveAccessToken = app.get('testLongLivedAccessToken');

chai.use(chaiHttp);
chai.use(chaiSubset);

describe('Registrations Service', () => {
  const service = app.service('registrations');
  const sequelize = app.get('sequelize');
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should check that the registrations service has been initialized', (done) => {
    expect(service).to.be.an('Object');
    done();
  });

  it('Should not let do a request if no accessToken is provided', (done) => {
    const params = {
      provider: 'rest',
      headers: {},
      query: {}
    };
    app.service('registrations').find(params)
      .catch((err) => {
        expect(err.code).to.equal(401);

        done();
      });
  });

  it('Should not let do a request if not valid accessToken is provided', (done) => {
    const params = {
      provider: 'rest',
      headers: {
        'authorization': `Bearer wrong.access.token`
      },
      query: {}
    };
    app.service('registrations').find(params)
      .catch((err) => {
        expect(err.code).to.equal(401);

        done();
      });
  });

  it('Should let do a request if valid accessToken is provided', (done) => {
    const params = {
      provider: 'rest',
      headers: {
        'authorization': `Bearer ${longLiveAccessToken}`
      },
      query: {
        'startDate': '2017-01-04',
        'endDate': '2017-01-06',
        'customerId': '1,2,4'
      }
    };

    sandbox.stub(app.service('registrations'), 'find')
      .returns(Promise.resolve([]));

    app.service('registrations').find(params)
      .then((result) => {
        expect(result.length).to.equal(0);

        done();
      })
      .catch((err) => {
        console.log(err);
      });
  });

});

describe('registrations service validate schema hook', () => {
  let testInput;
  let schemaValidatorHook = validateSchema(createRequestSchema, { coerceTypes: true });

  beforeEach((done) => {
    testInput = {
      "customerId": 1,
      "date": "2017-01-04",
      "userId": 1,
      "registrationPointId": 1,
      "amount": 2300,
      "unit": "kg",
      "currency": "DKK",
      "kgPerLiter": 2,
      "cost": 634,
      "comment": "Asdfasiduhgfiusdhfiudsghfihasioufhsioudhgfousghfioshoishbpivhsepibhepbhwephbwpivhpshbvpsiehbehbpisehbpi",
      errorCode: 'E060'
    };

    done();
  });

  it('should pass all validations', (done) => {
    const mockHook = {
      type: 'before',
      app: app,
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
      expect(result.data).to.deep.equal(testInput);

      done();
    }).catch((err) => {
      console.log('ERROR:');
      console.log(err);
    });
  });

  it('should return BadRequest error when "customerId" has string as value', (done) => {
    testInput.customerId = 'asd';
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'type',
        dataPath: '.customerId',
        schemaPath: '#/properties/customerId/type',
        params: { type: 'integer' },
        message: 'should be integer'
      }]);

      done();
    });
  });

  it('should return BadRequest error when "customerId" has a decimal/float as value', (done) => {
    testInput.customerId = 5.2;
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'type',
        dataPath: '.customerId',
        schemaPath: '#/properties/customerId/type',
        params: { type: 'integer' },
        message: 'should be integer'
      }]);

      done();
    });
  });

  it('should return BadRequest error when "customerId" has a negative integer as value', (done) => {
    testInput.customerId = -1;
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'minimum',
        dataPath: '.customerId',
        schemaPath: '#/properties/customerId/minimum',
        params: { comparison: '>=', limit: 1, exclusive: false },
        message: 'should be >= 1'
      }]);

      done();
    });
  });

  it('should return BadRequest error when "userId" has string as value', (done) => {
    testInput.userId = 'asd';
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'type',
        dataPath: '.userId',
        schemaPath: '#/properties/userId/type',
        params: { type: 'integer' },
        message: 'should be integer'
      }]);

      done();
    });
  });

  it('should return BadRequest error when "userId" has a decimal/float as value', (done) => {
    testInput.userId = 5.2;
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'type',
        dataPath: '.userId',
        schemaPath: '#/properties/userId/type',
        params: { type: 'integer' },
        message: 'should be integer'
      }]);

      done();
    });
  });

  it('should return BadRequest error when "userId" has a negative integer as value', (done) => {
    testInput.userId = -1;
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'minimum',
        dataPath: '.userId',
        schemaPath: '#/properties/userId/minimum',
        params: { comparison: '>=', limit: 1, exclusive: false },
        message: 'should be >= 1'
      }]);

      done();
    });
  });

  it('should return BadRequest error when "date" is missing', (done) => {
    delete testInput.date;
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'required',
        dataPath: '',
        schemaPath: '#/required',
        params: { missingProperty: 'date' },
        message: 'should have required property \'date\''
      }]);

      done();
    });
  });

  it('should return BadRequest error when "date" has wrong value', (done) => {
    testInput.date = '2017.01.04';
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('registrations'),
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'pattern',
        dataPath: '.date',
        schemaPath: '#/properties/date/pattern',
        params: { "pattern": "^\\d{4}[\\-]{1}((((0[13578])|(1[02]))[\\-]{1}(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\\-]{1}(([0-2][0-9])|(30)))|(02[\\-]{1}[0-2][0-9]))$" },
        message: 'should match pattern \"^\\d{4}[\\-]{1}((((0[13578])|(1[02]))[\\-]{1}(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\\-]{1}(([0-2][0-9])|(30)))|(02[\\-]{1}[0-2][0-9]))$\"'
      }]);

      done();
    });
  });


  it('should return BadRequest error when "date" has wrong value', (done) => {
    testInput.date = '2016-02-30';
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('registrations'),
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'pattern',
        dataPath: '.date',
        schemaPath: '#/properties/date/pattern',
        params: { "pattern": "^\\d{4}[\\-]{1}((((0[13578])|(1[02]))[\\-]{1}(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\\-]{1}(([0-2][0-9])|(30)))|(02[\\-]{1}[0-2][0-9]))$" },
        message: 'should match pattern \"^\\d{4}[\\-]{1}((((0[13578])|(1[02]))[\\-]{1}(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\\-]{1}(([0-2][0-9])|(30)))|(02[\\-]{1}[0-2][0-9]))$\"'
      }]);

      done();
    });
  });

  it('should return BadRequest error when "amount" is missing', (done) => {
    delete testInput.amount;
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('registrations'),
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'required',
        dataPath: '',
        schemaPath: '#/required',
        params: { 'missingProperty': 'amount' },
        message: 'should have required property \'amount\''
      }]);

      done();
    });
  });

  it('should return BadRequest error when "amount" has string as value', (done) => {
    testInput.amount = 'asd';
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('registrations'),
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'type',
        dataPath: '.amount',
        schemaPath: '#/properties/amount/type',
        params: { 'type': 'integer' },
        message: 'should be integer'
      }]);

      done();
    });
  });

  it('should return BadRequest error when "amount" has a negative integer as value', (done) => {
    testInput.amount = -1;
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('registrations'),
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'minimum',
        dataPath: '.amount',
        schemaPath: '#/properties/amount/minimum',
        params: {
          "comparison": ">=",
          "limit": 100,
          "exclusive": false
        },
        message: 'should be >= 100'
      }]);

      done();
    });
  });

  it('should return BadRequest error when "unit" is missing', (done) => {
    delete testInput.unit;
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('registrations'),
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'required',
        dataPath: '',
        schemaPath: '#/required',
        params: {
          'missingProperty': 'unit'
        },
        message: 'should have required property \'unit\''
      }]);

      done();
    });
  });

  it('should return BadRequest error when "unit" has a wrong value', (done) => {
    testInput.unit = 'asd';
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('registrations'),
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'enum',
        dataPath: '.unit',
        schemaPath: '#/properties/unit/enum',
        params: {
          'allowedValues': [
            'kg',
            'lt'
          ]
        },
        message: 'should be equal to one of the allowed values'
      }]);

      done();
    });
  });

  it('should return BadRequest error when "kgPerLiter" has a wrong value - not integer', (done) => {
    testInput.kgPerLiter = 'asd';
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('registrations'),
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'type',
        dataPath: '.kgPerLiter',
        schemaPath: '#/properties/kgPerLiter/type',
        params: {
          'type': 'integer'
        },
        message: 'should be integer'
      }]);

      done();
    });
  });

  it('should return BadRequest error when "kgPerLiter" has a negative integer as value', (done) => {
    testInput.kgPerLiter = -1;
    testInput.errorCode = 'E060';

    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('registrations'),
      data: testInput
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.data.input).to.deep.equal(testInput);
      expect(err.errors).to.deep.equal([{
        keyword: 'minimum',
        dataPath: '.kgPerLiter',
        schemaPath: '#/properties/kgPerLiter/minimum',
        params: {
          "comparison": ">=",
          "limit": 1,
          "exclusive": false
        },
        message: 'should be >= 1'
      }]);

      done();
    });
  });
});


describe('registrations service validate find schema hook', () => {
  const service = app.service('registrations');
  let schemaValidatorHook = validateSchema(findRequestSchema, { coerceTypes: true });

  it('should return BadRequest error when "startDate" is missing', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          // startDate: '2017-01-04', // startDate is missing from the query string for this test
          endDate: '2017-01-06',
          customerId: '1,2,4'
        }
      },
      service
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.errors).to.deep.equal([{
        keyword: 'required',
        dataPath: '',
        schemaPath: '#/required',
        params: {
          'missingProperty': 'startDate'
        },
        message: 'should have required property \'startDate\''
      }]);

      done();
    });
  });

  it('should return BadRequest error when "startDate" value is not a valid YYYY-MM-DD format', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          startDate: '201701-04', // startDate is not a valid format for this test
          endDate: '2017-01-06',
          customerId: '1,2,4'
        }
      },
      service
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.errors).to.deep.equal([{
        keyword: 'pattern',
        dataPath: '.startDate',
        schemaPath: '#/properties/startDate/pattern',
        params: {
          'pattern': '^\\d{4}[\\-]{1}((((0[13578])|(1[02]))[\\-]{1}(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\\-]{1}(([0-2][0-9])|(30)))|(02[\\-]{1}[0-2][0-9]))$'
        },
        message: 'should match pattern "^\\d{4}[\\-]{1}((((0[13578])|(1[02]))[\\-]{1}(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\\-]{1}(([0-2][0-9])|(30)))|(02[\\-]{1}[0-2][0-9]))$"'
      }]);

      done();
    });
  });

  it('should return BadRequest error when "startDate" value is an integer', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          startDate: 123, // startDate is not a valid format for this test
          endDate: '2017-01-06',
          customerId: '1,2,4'
        }
      },
      service
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');

      done();
    });
  });

  it('should return BadRequest error when "endDate" is missing', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          startDate: '2017-01-04',
          // endDate: '2017-01-06', // endDate is missing from the query string for this test
          customerId: '1,2,4'
        }
      },
      service
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.errors).to.deep.equal([{
        keyword: 'required',
        dataPath: '',
        schemaPath: '#/required',
        params: {
          'missingProperty': 'endDate'
        },
        message: 'should have required property \'endDate\''
      }]);

      done();
    });
  });

  it('should return BadRequest error when "endDate" value is not a valid YYYY-MM-DD format', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          startDate: '2017-01-04',
          endDate: '2017-0106', // endDate is not a valid format for this test
          customerId: '1,2,4'
        }
      },
      service
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.errors).to.deep.equal([{
        keyword: 'pattern',
        dataPath: '.endDate',
        schemaPath: '#/properties/endDate/pattern',
        params: {
          'pattern': '^\\d{4}[\\-]{1}((((0[13578])|(1[02]))[\\-]{1}(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\\-]{1}(([0-2][0-9])|(30)))|(02[\\-]{1}[0-2][0-9]))$'
        },
        message: 'should match pattern "^\\d{4}[\\-]{1}((((0[13578])|(1[02]))[\\-]{1}(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\\-]{1}(([0-2][0-9])|(30)))|(02[\\-]{1}[0-2][0-9]))$"'
      }]);

      done();
    });
  });

  it('should return BadRequest error when "endDate" value is an integer', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          startDate: '2017-01-04',
          endDate: 123, // endDate is not a valid format for this test
          customerId: '1,2,4'
        }
      },
      service
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');

      done();
    });
  });

  it('should return BadRequest error when a value in the "customerId" list is a word', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          startDate: '2017-01-04',
          endDate: '2017-01-06',
          customerId: '1,2,asd' // one of the values in the list is a string instead of an integer
        }
      },
      service
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.errors).to.deep.equal([{
        keyword: 'pattern',
        dataPath: '.customerId',
        schemaPath: '#/properties/customerId/pattern',
        params: {
          'pattern': '^(\\d+(,\\d+)*)?$'
        },
        message: 'should match pattern "^(\\d+(,\\d+)*)?$"'
      }]);

      done();
    });
  });

  it('should return BadRequest error when a value in the "customerId" list is a floating point number', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          startDate: '2017-01-04',
          endDate: '2017-01-06',
          customerId: '1,2,34.1'
        }
      },
      service
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.errors).to.deep.equal([{
        keyword: 'pattern',
        dataPath: '.customerId',
        schemaPath: '#/properties/customerId/pattern',
        params: {
          'pattern': '^(\\d+(,\\d+)*)?$'
        },
        message: 'should match pattern "^(\\d+(,\\d+)*)?$"'
      }]);

      done();
    });
  });

  it('should return BadRequest error when the "customerId" input ends with a comma', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          startDate: '2017-01-04',
          endDate: '2017-01-06',
          customerId: '1,27,31,'
        }
      },
      service
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.errors).to.deep.equal([{
        keyword: 'pattern',
        dataPath: '.customerId',
        schemaPath: '#/properties/customerId/pattern',
        params: {
          'pattern': '^(\\d+(,\\d+)*)?$'
        },
        message: 'should match pattern "^(\\d+(,\\d+)*)?$"'
      }]);

      done();
    });
  });

  it('should return BadRequest error when the "customerId" input starts with a comma', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          startDate: '2017-01-04',
          endDate: '2017-01-06',
          customerId: ',1,27,31'
        }
      },
      service
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.message).to.equal('JSON-Schema validation failed');
      expect(err.code).to.equal(400);
      expect(err.name).to.equal('BadRequest');
      expect(err.errors).to.deep.equal([{
        keyword: 'pattern',
        dataPath: '.customerId',
        schemaPath: '#/properties/customerId/pattern',
        params: {
          'pattern': '^(\\d+(,\\d+)*)?$'
        },
        message: 'should match pattern \"^(\\d+(,\\d+)*)?$\"'
      }]);

      done();
    });

  });
});
