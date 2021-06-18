'use strict';

const chai = require('chai');
const expect = chai.expect;
const app = require('../../../../../src/app').default;
const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findRequestSchema = schemas.get('tip-find-request');
const createRequestSchema = schemas.get('tip-create-request');
const patchRequestSchema = schemas.get('tip-patch-request');
const patchOperationsSchema = schemas.get('patch-operations-request.json');

const service = app.service('tips');

describe('tips service - tip-find-request schema', () => {
  const schemaValidatorHook = validateSchema(findRequestSchema, { coerceTypes: true });

  it('Should pass all validations', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          id: 1,
          title: "Come at me bro",
          locale: "EN",
          isActive: true
        }
      }
    };

    schemaValidatorHook(mockHook)
      .then((result) => {
        done();
      });
  });

  it('Should return BadRequest if title is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          title: {}
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if locale is not well formatted - an object', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          locale: {}
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if locale is not well formatted - shorter than 2 chars', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          locale: 'E'
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if locale is not well formatted - longer than 2 chars', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          locale: 'EN_'
        }
      }
    };

    schemaValidatorHook(mockHook)
      .catch((err) => {
        expect(err.code).to.equal(400);
        done();
      });
  });

  it('Should return BadRequest if isActive is not well formatted', (done) => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {
        query: {
          isActive: 'EN_'
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

describe('tips service - create-request schema', () => {
  const schemaValidatorHook = validateSchema(createRequestSchema, { coerceTypes: true });

  it('Should pass all validations', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "title": {
          "EN": "A new title in english",
          "DK": "Det er en DK title",
          "NO": "Blah blah in Norwegian"
        },
        "content": {
          "EN": "This is the content in EN",
          "DK": "Det er contenten i Dansk",
          "NO": "Blah blah in Norwegian"
        },
        "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
        "isActive": false
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

  it('Should return BadRequest if title is not provided', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "content": {
          "EN": "This is the content in EN",
          "DK": "Det er contenten i Dansk",
          "NO": "Blah blah in Norwegian"
        },
        "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
        "isActive": false
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

  it('Should return BadRequest if title.EN is not provided', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "title": {
          // "EN": "A new title in english",
          "DK": "Det er en DK title",
          "NO": "Blah blah in Norwegian"
        },
        "content": {
          "EN": "This is the content in EN",
          "DK": "Det er contenten i Dansk",
          "NO": "Blah blah in Norwegian"
        },
        "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
        "isActive": false
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

  it('Should return BadRequest if title.DK is an empty string', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "title": {
          "EN": "A new title in english",
          "DK": "",
          "NO": "Blah blah in Norwegian"
        },
        "content": {
          "EN": "This is the content in EN",
          "DK": "Det er contenten i Dansk",
          "NO": "Blah blah in Norwegian"
        },
        "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
        "isActive": false
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

  it('Should return BadRequest if content is not provided', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "title": {
          "EN": "A new title in english",
          "DK": "Det er en DK title",
          "NO": "Blah blah in Norwegian"
        },
        "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
        "isActive": false
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

  it('Should return BadRequest if content.EN is not provided', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "title": {
          "EN": "A new title in english",
          "DK": "Det er en DK title",
          "NO": "Blah blah in Norwegian"
        },
        "content": {
          // "EN": "This is the content in EN",
          "DK": "Det er contenten i Dansk",
          "NO": "Blah blah in Norwegian"
        },
        "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
        "isActive": false
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

  it('Should return BadRequest if title is not well formatted - is a string', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "title": "come at me bro",
        "content": {
          "EN": "This is the content in EN",
          "DK": "Det er contenten i Dansk",
          "NO": "Blah blah in Norwegian"
        },
        "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
        "isActive": false
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

  it('Should return BadRequest if content is not well formatted - is a string', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "title": {
          "EN": "A new title in english",
          "DK": "Det er en DK title",
          "NO": "Blah blah in Norwegian"
        },
        "content": "come at me bro",
        "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
        "isActive": false
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

  it('Should return BadRequest if imageUrl is not well formatted - is an object', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "title": {
          "EN": "A new title in english",
          "DK": "Det er en DK title",
          "NO": "Blah blah in Norwegian"
        },
        "content": {
          "EN": "This is the content in EN",
          "DK": "Det er contenten i Dansk",
          "NO": "Blah blah in Norwegian"
        },
        "imageUrl": {},
        "isActive": false
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

  it('Should return BadRequest if isActive is not well formatted - is a number', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "title": {
          "EN": "A new title in english",
          "DK": "Det er en DK title",
          "NO": "Blah blah in Norwegian"
        },
        "content": {
          "EN": "This is the content in EN",
          "DK": "Det er contenten i Dansk",
          "NO": "Blah blah in Norwegian"
        },
        "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
        "isActive": 123
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

describe('tips service - patch-operations-request schema', () => {
  const schemaValidatorHook = validateSchema(patchOperationsSchema, { coerceTypes: true });
  let testInput;
  beforeEach((done) => {
    testInput = [
      {
        "op": "replace",
        "path": "/title/EN",
        "value": "come at me bro"
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

describe('tips service - patch-request schema', () => {
  const schemaValidatorHook = validateSchema(patchRequestSchema, { coerceTypes: true });

  it('Should pass all validations', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "title": {
          "EN": "A new title in english",
          "DK": "Det er en DK title",
          "NO": "Blah blah in Norwegian"
        },
        "content": {
          "EN": "This is the content in EN",
          "DK": "Det er contenten i Dansk",
          "NO": "Blah blah in Norwegian"
        },
        "imageUrl": "www.asdasdasdadas.com",
        "isActive": false
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


  it('Should return BadRequest if title.DK is an empty string', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "title": {
          "EN": "A new title in english",
          "DK": "",
          "NO": "Blah blah in Norwegian"
        },
        "content": {
          "EN": "This is the content in EN",
          "DK": "Det er contenten i Dansk",
          "NO": "Blah blah in Norwegian"
        },
        "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
        "isActive": false
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

  it('Should return BadRequest if content.EN is an empty string', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "title": {
          "EN": "A new title in english",
          "DK": "Blahasudhiaushiuhadsd",
          "NO": "Blah blah in Norwegian"
        },
        "content": {
          "EN": "",
          "DK": "Det er contenten i Dansk",
          "NO": "Blah blah in Norwegian"
        },
        "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
        "isActive": false
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

  it('Should return BadRequest if imageUrl is an empty string', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "title": {
          "EN": "A new title in english",
          "DK": "",
          "NO": "Blah blah in Norwegian"
        },
        "content": {
          "EN": "This is the content in EN",
          "DK": "Det er contenten i Dansk",
          "NO": "Blah blah in Norwegian"
        },
        "imageUrl": "",
        "isActive": false
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

  it('Should return BadRequest if isActive is not a boolean value', (done) => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      data: {
        "title": {
          "EN": "A new title in english",
          "DK": "",
          "NO": "Blah blah in Norwegian"
        },
        "content": {
          "EN": "This is the content in EN",
          "DK": "Det er contenten i Dansk",
          "NO": "Blah blah in Norwegian"
        },
        "imageUrl": "www.sdihfsudhfiusdhiufhsdui.com",
        "isActive": "come at me bro"
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
