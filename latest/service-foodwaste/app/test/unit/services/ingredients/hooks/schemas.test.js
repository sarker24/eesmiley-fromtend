'use strict';

const chai = require('chai');
const expect = chai.expect;
const app = require('../../../../../src/app').default;
const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findRequestSchema = schemas.get('ingredient-find-request');
const createRequestSchema = schemas.get('ingredient-create-request');
const patchRequestSchema = schemas.get('ingredient-patch-request');
const patchOperationsSchema = schemas.get('patch-operations-request.json');

const service = app.service('ingredients');

describe('ingredients service - ingredient-find-request schema', () => {
  const schemaValidatorHook = validateSchema(findRequestSchema);

  it('Should pass all validations', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          cost: 1,
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
          cost: 'This is bad formatted'
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

  it('Should return BarRequest if currency is not wel formatted (too long)', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        provider: 'rest',
        query: {
          'name': 'Very wrong name',
          'cost': 112,
          'customerId': 1,
          'currency': 'DKKK'
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BarRequest if currency is not wel formatted (too short)', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          'name': 'Very wrong name',
          'cost': 112,
          'customerId': 1,
          'currency': 'DK'
        },
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BarRequest if unit is not a string', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          'name': 'Very wrong name',
          'cost': 112,
          'customerId': 1,
          'unit': 12345
        },
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BarRequest if unit is to short', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          'name': 'Very wrong name',
          'cost': 112,
          'customerId': 1,
          'unit': ''
        },
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

describe('ingredients service - create-request schema', () => {
  const schemaValidatorHook = validateSchema(createRequestSchema);

  it('Should pass all validations', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "name": "test ingredient",
        "cost": 123,
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
        'cost': 123,
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

  it('Should return BadRequest if cost is not provided', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        'name': 'Very wrong name',
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

  it('Should return BadRequest if cost is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        'name': 'test ingredient',
        'cost': 'Very wrong format',
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
        'name': 'Very wrong name',
        'cost': 112,
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

  it('Should return BarRequest if currency is not wel formatted (too long)', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        'name': 'Very wrong name',
        'cost': 112,
        'customerId': 1,
        'currency': 'DKKK'
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

  it('Should return BarRequest if currency is not wel formatted (too short)', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        'name': 'Very wrong name',
        'cost': 112,
        'customerId': 1,
        'currency': 'DK'
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

  it('Should return BarRequest if unit is not a string', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        'name': 'Very wrong name',
        'cost': 112,
        'customerId': 1,
        'unit': 12345
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

  it('Should return BarRequest if unit is too short', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        'name': 'Very wrong name',
        'cost': 112,
        'customerId': 1,
        'unit': ''
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

describe('ingredients service - patch-operations-request schema', () => {
  const schemaValidatorHook = validateSchema(patchOperationsSchema);
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

describe('ingredients service - patch-request schema', () => {
  const schemaValidatorHook = validateSchema(patchRequestSchema);

  it('Should pass all validations', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "name": "test ingredient",
        "cost": 1,
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
        'name': 'test ingredient',
        'cost': 'Very wrong format',
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
        'name': 'Very wrong name',
        'cost': 132,
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

  it('Should return BarRequest if currency is not wel formatted (too long)', (done) => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: {
        'name': 'Very wrong name',
        'cost': 112,
        'customerId': 1,
        'currency': 'DKKK'
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

  it('Should return BarRequest if currency is not wel formatted (too short)', (done) => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: {
        'name': 'Very wrong name',
        'cost': 112,
        'customerId': 1,
        'currency': 'DK'
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

  it('Should return BarRequest if unit is not a string', (done) => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: {
        'name': 'Very wrong name',
        'cost': 112,
        'customerId': 1,
        'unit': 12345
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

  it('Should return BarRequest if unit is too short', (done) => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: {
        'name': 'Very wrong name',
        'cost': 112,
        'customerId': 1,
        'unit': ''
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
