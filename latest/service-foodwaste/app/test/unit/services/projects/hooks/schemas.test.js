'use strict';

const chai = require('chai');
const expect = chai.expect;
const app = require('../../../../../src/app').default;
const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findRequestSchema = schemas.get('project-find-request');
const createRequestSchema = schemas.get('project-create-request');
const patchRequestSchema = schemas.get('project-patch-request');
const patchOperationsSchema = schemas.get('patch-operations-request.json');


const service = app.service('projects');

describe('projects service - action-find-request schema', () => {

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

describe('projects service - create-request schema', () => {
  const schemaValidatorHook = validateSchema(createRequestSchema, { coerceTypes: true });
  let testInput;
  beforeEach((done) => {
    testInput = {
      "name": "Project Name",
      "duration": {
        "type": "REGISTRATIONS",
        "days": 10
      },
      "userId": 1,
      "customerId": 1,
      "status": "PENDING_START",
      "registrationPoints": [
        {
          "id": 10000,
          "name": "Hawaiian pizza"
        },
        {
          "id": 10020,
          "name": "Chicken wings"
        }
      ],
      "actions": [
        {
          "id": 1,
          "name": "Use smaller plates"
        },
        {
          "id": 2,
          "name": "Use napkins with drawings"
        }
      ],
      "parentProjectId": 1
    };

    done();
  });


  it('Should pass all validations', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
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
    delete testInput.name;

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if duration is not provided', (done) => {
    delete testInput.duration;

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if duration.type is not provided', (done) => {
    delete testInput.duration.type;

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if duration.type is different from REGISTRATIONS ot CALENDAR', (done) => {
    testInput.duration.type = 'HOMER SIMPSON';

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if duration.days is not a number', (done) => {
    testInput.duration.days = 'Three days';

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
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
    testInput.userId = 'BART SIMPSON';

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
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
    testInput.customerId = 'BART SIMPSON';

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if status is not one of the allowed values', (done) => {
    testInput.status = 'SIMPSON';

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
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


  it('Should return BadRequest if actions.id is not provided', (done) => {
    delete testInput.actions[0].id;

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if actions.id is not well formatted', (done) => {
    testInput.actions[0].id = 'WATER';

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if actions.name is not provided', (done) => {
    delete testInput.actions[0].name;

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
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


  it('Should return BadRequest if registrationPoint.id is not provided', (done) => {
    delete testInput.registrationPoints[0].id;

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if registrationPoint.id is not well formatted', (done) => {
    testInput.registrationPoints[0].id = 'WATER';

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if parentProjectId is not well formatted', (done) => {
    testInput.parentProjectId = 'HOMERO SIMPSON';

    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if duration.type === REGISTRATIONS and there is not duration.days', (done) => {
    testInput.duration.type = 'REGISTRATIONS';
    delete testInput.duration.days;
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E060');
        expect(err.code).to.equal(400);

        done();
      });
  });

  it('Should return BadRequest if duration.type === CALENDAR and there is not duration.end', (done) => {
    testInput.duration.type = 'CALENDAR';
    testInput.duration.start = 200000000000000000;
    delete testInput.duration.end;
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E060');
        expect(err.code).to.equal(400);

        done();
      });
  });
  it('Should return BadRequest if duration.type === CALENDAR and there is not duration.start', (done) => {
    testInput.duration.type = 'CALENDAR';
    testInput.duration.end = 200000000000000000;
    delete testInput.duration.start;
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: testInput,
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E060');
        expect(err.code).to.equal(400);

        done();
      });
  });
});

describe('projects service - patch-operations-request schema', () => {
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

describe('projects service - patch-request schema', () => {
  const schemaValidatorHook = validateSchema(patchRequestSchema, { coerceTypes: true });
  let testInput;
  beforeEach((done) => {
    testInput = {
      "name": "Project Name",
      "duration": {
        "type": "REGISTRATIONS",
        "days": 10
      },
      "userId": 1,
      "customerId": 1,
      "status": "PENDING_START",
      "registrationPoints": [
        {
          "id": 1,
          "name": "Hawaiian pizza"
        },
        {
          "id": 2,
          "name": "Chicken wings"
        }
      ],
      "actions": [
        {
          "id": 1,
          "name": "Use smaller plates"
        },
        {
          "id": 2,
          "name": "Use napkins with drawings"
        }
      ],
      "parentProjectId": 1
    };

    done();
  });


  it('Should pass all validations', (done) => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: testInput,
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .then((result) => {
        done();
      });
  });

  it('Should return BadRequest if duration.type is different from REGISTRATIONS ot CALENDAR', (done) => {
    testInput.duration.type = 'HOMER SIMPSON';

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if duration.days is not a number', (done) => {
    testInput.duration.days = 'Three days';

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: testInput,
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
    testInput.userId = 'BART SIMPSON';

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: testInput,
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
    testInput.customerId = 'BART SIMPSON';

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if status is not one of the allowed values', (done) => {
    testInput.status = 'SIMPSON';

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if actions.id is not well formatted', (done) => {
    testInput.actions[0].id = 'WATER';

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if registrationPoint.id is not well formatted', (done) => {
    testInput.registrationPoints[0].id = 'WATER';

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if parentProjectId is not well formatted', (done) => {
    testInput.parentProjectId = 'HOMERO SIMPSON';

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: testInput,
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

  it('Should return BadRequest if active is not well formatted', (done) => {
    testInput.active = 'fake';
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: testInput,
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
  it('Should return BadRequest if duration.type === REGISTRATIONS and there is not duration.days', (done) => {
    testInput.duration.type = 'REGISTRATIONS';
    delete testInput.duration.days;
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: testInput,
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E060');
        expect(err.code).to.equal(400);

        done();
      });
  });

  it('Should return BadRequest if duration.type === CALENDAR and there is not duration.end', (done) => {
    testInput.duration.type = 'CALENDAR';
    testInput.duration.start = 200000000000000000;
    delete testInput.duration.end;
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: testInput,
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E060');
        expect(err.code).to.equal(400);

        done();
      });
  });
  it('Should return BadRequest if duration.type === CALENDAR and there is not duration.start', (done) => {
    testInput.duration.type = 'CALENDAR';
    testInput.duration.end = 200000000000000000;
    delete testInput.duration.start;
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      data: testInput,
      params: {
        provider: 'rest'
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.data.errorCode).to.equal('E060');
        expect(err.code).to.equal(400);

        done();
      });
  });
});
