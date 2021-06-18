'use strict';

const chai = require('chai');
const expect = chai.expect;
const app = require('../../../../../app/src/app').default;
const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findRequestSchemaImprovements = schemas.get('registration-improvements-find-request.json');

describe('Registrations Service - improvements schemas', () => {
  const schemaValidatorHook = validateSchema(findRequestSchemaImprovements);

  it('Should pass all validations', () => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          interval: 'week',
          start: '2017-01-01',
          end: '2017-12-31',
          accountIds: '1,2,3'
        }
      }
    };

    return schemaValidatorHook(mockHook, { coerceTypes: true })
      .then((result) => {
        expect(result).to.be.an('object');
      })
      .catch((err) => {
        console.log(err);
      });
  });

  it('Should not return BadRequest if "accountIds" property is not present', async () => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          interval: 'week',
          start: '2017-01-01',
          end: '2017-12-31'
        }
      }
    };

    try {
      await schemaValidatorHook(mockHook, { coerceTypes: true });
    } catch (err) {
      expect(result).to.be.an('object');
    }
  });

  it('Should return BadRequest if "period" property is not present', async () => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          start: '2017-01-01',
          end: '2017-12-31',
          accountIds: '1,2,3'
        }
      }
    };

    try {
      await schemaValidatorHook(mockHook);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.errors[0].message).to.equal('should have required property \'interval\'');
    }
  });

  it('Should return BadRequest if "start" property is not present', async () => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          interval: 'week',
          end: '2017-12-31',
          accountIds: '1,2,3'
        }
      }
    };

    try {
      await schemaValidatorHook(mockHook);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.errors[0].message).to.equal('should have required property \'start\'');
    }
  });

  it('Should return BadRequest if "end" property is not present', async () => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          interval: 'week',
          start: '2017-01-01',
          accountIds: '1,2,3'
        }
      }
    };

    try {
      await schemaValidatorHook(mockHook);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.errors[0].message).to.equal('should have required property \'end\'');
    }
  });

  it('Should return BadRequest if "period" value is neither of "day", "week" or "month"', async () => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          interval: 'something',
          start: '2017-01-01',
          end: '2017-12-31',
          accountIds: '1,2,3'
        }
      }
    };

    try {
      await schemaValidatorHook(mockHook);
    } catch (err) {
      expect(err.code).to.equal(400);
    }
  });

  it('Should return BadRequest if "start" value is not a well formatted date', async () => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          interval: 'week',
          start: '2017-01-1',
          end: '2017-12-31',
          accountIds: '1,2,3'
        }
      }
    };

    try {
      await schemaValidatorHook(mockHook);
    } catch (err) {
      expect(err.code).to.equal(400);
    }
  });

  it('Should return BadRequest if "end" value is not a well formatted date', async () => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          interval: 'week',
          start: '2017-01-10',
          end: '2017-12-312',
          accountIds: '1,2,3'
        }
      }
    };

    try {
      await schemaValidatorHook(mockHook);
    } catch (err) {
      expect(err.code).to.equal(400);
    }
  });

  it('Should return BadRequest if "accountIds" value starts with a comma', async () => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          interval: 'week',
          start: '2017-01-10',
          end: '2017-12-31',
          accountIds: ',1,2,3'
        }
      }
    };

    try {
      await schemaValidatorHook(mockHook);
    } catch (err) {
      expect(err.code).to.equal(400);
    }
  });

  it('Should return BadRequest if "accountIds" value ends with a comma', async () => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          interval: 'week',
          start: '2017-01-10',
          end: '2017-12-31',
          accountIds: '1,2,3,'
        }
      }
    };

    try {
      await schemaValidatorHook(mockHook);
    } catch (err) {
      expect(err.code).to.equal(400);
    }
  });

  it('Should return BadRequest if "accountIds" value has two commas next to each other', async () => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          interval: 'week',
          start: '2017-01-10',
          end: '2017-12-31',
          accountIds: '1,2,,3'
        }
      }
    };

    try {
      await schemaValidatorHook(mockHook);
    } catch (err) {
      expect(err.code).to.equal(400);
    }
  });

  it('Should return BadRequest if "accountIds" value contains a symbol different from comma or integer', async () => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          interval: 'week',
          start: '2017-01-10',
          end: '2017-12-31',
          accountIds: '1,2,s3'
        }
      }
    };

    try {
      await schemaValidatorHook(mockHook);
    } catch (err) {
      expect(err.code).to.equal(400);
    }
  });

  it('Should return BadRequest if "accountsIds" value contains more than 5 integers', async () => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          interval: 'week',
          start: '2017-01-10',
          end: '2017-12-31',
          accountsIds: '1,2,3,4,5,6'
        }
      }
    };

    try {
      await schemaValidatorHook(mockHook);
    } catch (err) {
      expect(err.code).to.equal(400);
    }
  });
});
