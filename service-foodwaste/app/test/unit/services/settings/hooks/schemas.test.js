'use strict';

const chai = require('chai');
const expect = chai.expect;
const app = require('../../../../../src/app').default;
const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const createRequestSchema = schemas.get('settings-request.json');
const patchSchema = schemas.get('settings-patch-request.json');

describe('settings service validate create schema hook', () => {
  let testInput;
  const schemaValidatorHook = validateSchema(createRequestSchema, { coerceTypes: true });

  beforeEach((done) => {
    testInput = {
      "customerId": 2,
      "userId": 1,
      "settings": {
        "date": "2017-01-04",
        "area": "K�kken",
        "category": "Gr�nsager",
        "product": "Tomat",
        "amount": 23,
        "unit": "kg",
        "currency": "DKK",
        "kgPerLiter": 2,
        "cost": 634,
        "note": "NANANANANANANANANANANANANANA BATMAAAAAAN ��� !@#$%^&*()_+?><|:\\/"
      },
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
    });
  });

  it('should return BadRequest error when "customerId" is missing', (done) => {
    delete testInput.customerId;
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
        params: { "missingProperty": "customerId" },
        message: 'should have required property \'customerId\''
      }]);

      done();
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

  it('should return BadRequest error when "userId" is missing', (done) => {
    delete testInput.userId;
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
        params: { missingProperty: 'userId' },
        message: 'should have required property \'userId\''
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

  it('should return BadRequest error when "settings" is missing', (done) => {
    delete testInput.settings;
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
        params: { missingProperty: 'settings' },
        message: 'should have required property \'settings\''
      }]);

      done();
    });
  });

  it('should return BadRequest error when "settings" is a string instead of an object', (done) => {
    testInput.settings = 'asd';
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
        dataPath: '.settings',
        schemaPath: '#/properties/settings/type',
        params: { type: 'object' },
        message: 'should be object'
      }]);

      done();
    });
  });

});

describe('settings service validate patch schema hook', () => {
  let testInput;
  const schemaValidatorHook = validateSchema(patchSchema, { coerceTypes: true });

  beforeEach((done) => {
    testInput = {
      "id": "1",
      "customerId": "1",
      "userId": "1",
      "current": {
        "areas": [
          "K�kkeana3"
        ],
        "currency": "DKK"
      },
      "updateTime": "2017-08-03T08:50:05.000Z",
      "createTime": "2017-08-03T07:51:31.000Z",
      "history": {
        "1501750205325": {
          "userId": "1",
          "settings": {
            "areas": [
              "K�kkeana3"
            ],
            "currency": "DKK"
          },
          "customerId": "1"
        },
        "currentTimestamp": {
          "userId": "1",
          "settings": {
            "areas": [
              "K�kkeana2"
            ],
            "currency": "DKK"
          },
          "customerId": "1"
        }
      }
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

      done();
    });
  });

  it('should return BadRequest error when "current" is a string instead of an object', (done) => {
    testInput.current = 'asd';
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

      done();
    });
  });

  it('should return BadRequest error when "history" is a string instead of an object', (done) => {
    testInput.history = 'asd';
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

      done();
    });
  });

});



