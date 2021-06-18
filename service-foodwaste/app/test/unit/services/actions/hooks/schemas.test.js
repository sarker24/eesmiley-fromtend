'use strict';

const chai = require('chai');
const expect = chai.expect;
const app = require('../../../../../src/app').default;
const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findRequestSchema = schemas.get('action-find-request');
const createRequestSchema = schemas.get('action-create-request');
const patchRequestSchema = schemas.get('action-patch-request');
const patchOperationsSchema = schemas.get('patch-operations-request.json');

const service = app.service('actions');

describe('actions service - action-find-request schema', () => {
  const schemaValidatorHook = validateSchema(findRequestSchema, { coerceTypes: true });

  it('Should pass all validations', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          userId: 1,
          customerId: 1,
          name: 'Test name'
        }
      }
    };

    schemaValidatorHook(mockHook)
      .then((result) => {
        done();
      });
  });

  it('Should return BadRequest if userId is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          userId: 'This is bad formatted'
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if customerId is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          customerId: 'This is bad formatted'
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });
});

describe('actions service - create-request schema', () => {
  const schemaValidatorHook = validateSchema(createRequestSchema, { coerceTypes: true });

  it('Should pass all validations', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "name": "test action",
        "description": "This a test action",
        "userId": 1,
        "customerId": 1
      },
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .then((result) => {
        done();
      });
  });

  it('Should return BadRequest if name is not provided', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        'description': 'This a test action',
        'userId': 1,
        'customerId': 1
      },
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if userId is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        'name': 'test action',
        'description': 'This a test action',
        'userId': 'Very wrong format',
        'customerId': 1
      },
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if customerId is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        'description': 'This a test action',
        'name': 'Very wrong name',
        'userId': 1,
        'customerId': 'very Bad format'
      },
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });
});

describe('actions service - patch-operations-request schema', () => {
  const schemaValidatorHook = validateSchema(patchOperationsSchema, { coerceTypes: true });
  let testInput;
  beforeEach((done) => {
    testInput = [
      {
        "op": "replace",
        "path": "/name",
        "value": "new name"
      }
    ] ;

    done();
  });


  it('should pass all validations', (done) => {
    const mockHook = {
      type: 'before',
      app: app,
      data: testInput,
      method: 'patch'
    };

    schemaValidatorHook(mockHook).then((result) => {
      done();
    });
  });

  it('should return BadRequest when op is different from the ones defined by RFC6902', (done) => {
    testInput[0].op = 'fakeOperation';

    const mockHook = {
      type: 'before',
      app: app,
      data: testInput,
      method: 'patch'
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.code).to.equal(400);

      done();
    });
  });

  it('should return BadRequest when op is missing', (done) => {
    delete testInput[0].op;

    const mockHook = {
      type: 'before',
      app: app,
      data: testInput,
      method: 'patch'
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.code).to.equal(400);

      done();
    });
  });

  it('should return BadRequest when path is missing', (done) => {
    delete testInput[0].path;

    const mockHook = {
      type: 'before',
      app: app,
      data: testInput,
      method: 'patch'
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.code).to.equal(400);

      done();
    });
  });

  it('should return BadRequest when path does not start with a /', (done) => {
    testInput[0].path = "name";

    const mockHook = {
      type: 'before',
      app: app,
      data: testInput,
      method: 'patch'
    };

    schemaValidatorHook(mockHook).then((result) => {
    }).catch((err) => {
      expect(err.code).to.equal(400);

      done();
    });
  });
});

describe('actions service - patch-request schema', () => {
  const schemaValidatorHook = validateSchema(patchRequestSchema, { coerceTypes: true });

  it('Should pass all validations', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "name": "test action",
        "description": "This a test action",
        "userId": 1,
        "customerId": 1
      },
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .then((result) => {
        done();
      });
  });


  it('Should return BadRequest if userId is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        'name': 'test action',
        'description': 'This a test action',
        'userId': 'Very wrong format',
        'customerId': 1
      },
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if customerId is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        'description': 'This a test action',
        'name': 'Very wrong name',
        'userId': 1,
        'customerId': 'very Bad format'
      },
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });
});
