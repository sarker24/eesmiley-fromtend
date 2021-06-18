'use strict';

const chai = require('chai');
const expect = chai.expect;
const app = require('../../../../../src/app').default;
const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findRequestSchema = schemas.get('sale-find-request');
const createRequestSchema = schemas.get('sale-create-request');
const patchRequestSchema = schemas.get('sale-patch-request');
const patchOperationsSchema = schemas.get('patch-operations-request.json');

const service = app.service('sales');

describe('sales service - sale-find-request schema', () => {
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
          date: '2017-05-04',
          income: 10000,
          portions: 45,
          portionPrice: 222,
          guests: 45,
          productionCost: 123,
          productionWeight: 54
        }
      }
    };

    schemaValidatorHook(mockHook)
      .then((result) => {
        expect(result.data).to.deep.equal(mockHook.data);
        done();
      });
  });

  it('Should pass all validations with zero, null and missing parameters', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          userId: 1,
          customerId: 1,
          date: '2017-05-04',
          income: 10000,
          portions: null,
          portionPrice: 0,
          guests: 45,
          productionCost: 123,
          //productionWeight: 54
        }
      }
    };

    schemaValidatorHook(mockHook)
      .then((result) => {
        expect(result.data).to.deep.equal(mockHook.data);
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

  it('Should return BadRequest if date is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          date: '2017-05-043',
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if income is a double', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          income: 100.91
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if income is a string', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          income: 'aaaa'
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if portions is a double', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          portions: 45.54
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if portions is a string', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          portions: 'aaa'
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if portionPrice is a double', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          portionPrice: 22.2
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if portionPrice is a string', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          portionPrice: 'aaa'
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if guests is a double', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          guests: 45.4
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if guests is a string', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          guests: 'aa'
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if productionCost is a double', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          productionCost: 12.3
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if productionCost is a string', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          productionCost: 'aa'
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if productionWeight is a double', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          productionWeight: 54.7
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if productionWeight is a string', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          productionWeight: 'aa'
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

describe('sales service - create-request schema', () => {
  const schemaValidatorHook = validateSchema(createRequestSchema, { coerceTypes: true });

  it('Should pass all validations', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        date: '2017-05-04',
        income: 10000,
        portions: 45,
        portionPrice: 222,
        guests: 45,
        productionCost: 123,
        productionWeight: 54
      },
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .then((result) => {
        expect(result.data).to.deep.equal(mockHook.data);
        done();
      });
  });

  it('Should return BadRequest if date is not provided', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        // date: '2017-05-04',
        income: 10000,
        portions: 45,
        portionPrice: 222,
        guests: 45,
        productionCost: 123,
        productionWeight: 54
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

  it('Should return BadRequest if date is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        date: '201705-04',
        income: 10000,
        portions: 45,
        portionPrice: 222,
        guests: 45,
        productionCost: 123,
        productionWeight: 54
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
        userId: 'Very wrong format',
        customerId: 1,
        date: '2017-05-04',
        income: 10000,
        portions: 45,
        portionPrice: 222,
        guests: 45,
        productionCost: 123,
        productionWeight: 54
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
        userId: 1,
        customerId: 'very bad format',
        date: '2017-05-04',
        income: 10000,
        portions: 45,
        portionPrice: 222,
        guests: 45,
        productionCost: 123,
        productionWeight: 54
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

  it('Should not fail if income is not provided', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        date: '2017-05-04',
        // income: 10000,
        portions: 45,
        portionPrice: 222,
        guests: 45,
        productionCost: 123,
        productionWeight: 54
      },
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .then((result) => {
        expect(result.data).to.deep.equal(mockHook.data);
        done();
      });
  });

  it('Should return BadRequest if income is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        date: '2017-05-04',
        income: 100.40, // it's a double instead of integer
        portions: 45,
        portionPrice: 222,
        guests: 45,
        productionCost: 123,
        productionWeight: 54
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

  it('Should not fail if portions is not provided', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        date: '2017-05-04',
        income: 10000,
        // portions: 45,
        portionPrice: 222,
        guests: 45,
        productionCost: 123,
        productionWeight: 54
      },
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .then((result) => {
        expect(result.data).to.deep.equal(mockHook.data);
        done();
      });
  });

  it('Should return BadRequest if portions is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        date: '2017-05-04',
        income: 10000,
        portions: 45.7, // it's a double instead of integer
        portionPrice: 222,
        guests: 45,
        productionCost: 123,
        productionWeight: 54
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

  it('Should not fail if portionPrice is not provided', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        date: '2017-05-04',
        income: 10000,
        portions: 45,
        // portionPrice: 222,
        guests: 45,
        productionCost: 123,
        productionWeight: 54
      },
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .then((result) => {
        expect(result.data).to.deep.equal(mockHook.data);
        done();
      });
  });

  it('Should return BadRequest if portionPrice is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        date: '2017-05-04',
        income: 10000,
        portions: 45,
        portionPrice: 22.2, // it's a double instead of integer
        guests: 45,
        productionCost: 123,
        productionWeight: 54
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

  it('Should not fail if guests is not provided', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        date: '2017-05-04',
        income: 10000,
        portions: 45,
        portionPrice: 222,
        // guests: 45,
        productionCost: 123,
        productionWeight: 54
      },
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .then((result) => {
        expect(result.data).to.deep.equal(mockHook.data);
        done();
      });
  });

  it('Should return BadRequest if guests is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        date: '2017-05-04',
        income: 10000,
        portions: 45,
        portionPrice: 222,
        guests: 45.7, // It's a double instead of integer
        productionCost: 123,
        productionWeight: 54
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

  it('Should not fail if productionCost is not provided', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        date: '2017-05-04',
        income: 10000,
        portions: 45,
        portionPrice: 222,
        guests: 45,
        // productionCost: 123,
        productionWeight: 54
      },
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .then((result) => {
        expect(result.data).to.deep.equal(mockHook.data);
        done();
      });
  });

  it('Should return BadRequest if productionCost is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        date: '2017-05-04',
        income: 10000,
        portions: 45,
        portionPrice: 222,
        guests: 45,
        productionCost: 123.7,
        productionWeight: 54
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

  it('Should not fail if productionWeight is not provided', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        date: '2017-05-04',
        income: 10000,
        portions: 45,
        portionPrice: 222,
        guests: 45,
        productionCost: 123
        // productionWeight: 54
      },
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .then((result) => {
        expect(result.data).to.deep.equal(mockHook.data);
        done();
      });
  });

  it('Should return BadRequest if productionWeight is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        date: '2017-05-04',
        income: 10000,
        portions: 45,
        portionPrice: 222,
        guests: 45,
        productionCost: 123,
        productionWeight: 54.7
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

describe('sales service - patch-operations-request schema', () => {
  const schemaValidatorHook = validateSchema(patchOperationsSchema, { coerceTypes: true });
  let testInput;
  beforeEach((done) => {
    testInput = [
      {
        "op": "replace",
        "path": "/income",
        "value": 1045645
      }
    ];

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
      expect(result.data).to.deep.equal(mockHook.data);
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
    testInput[0].path = 'income';

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

describe('sales service - patch-request schema', () => {
  const schemaValidatorHook = validateSchema(patchRequestSchema, { coerceTypes: true });

  it('Should pass all validations', (done) => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: {
        userId: 1,
        customerId: 1,
        date: '2017-05-04',
        income: 10000,
        portions: 45,
        portionPrice: 222,
        guests: 45,
        productionCost: 123,
        productionWeight: 54
      },
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .then((result) => {
        expect(result.data).to.deep.equal(mockHook.data);
        done();
      });
  });

  it('Should return BadRequest if date is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: {
        date: '201705-04',
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

  it('Should return BadRequest if income is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: {
        income: 100.40, // it's a double instead of integer
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

  it('Should return BadRequest if portions is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: {
        portions: 45.7, // it's a double instead of integer
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

  it('Should return BadRequest if portionPrice is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: {
        portionPrice: 22.2, // it's a double instead of integer
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

  it('Should return BadRequest if guests is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: {
        guests: 45.7 // It's a double instead of integer
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

  it('Should return BadRequest if productionCost is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: {
        productionCost: 123.7  // It's a double instead of integer
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

  it('Should return BadRequest if productionWeight is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: {
        productionWeight: 54.7 // It's a double instead of integer
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
