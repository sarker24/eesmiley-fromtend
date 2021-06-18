'use strict';

const app = require('../../../../../src/app').default;
const buildTree = require('../../../../../src/services/registration-points/hooks/build-tree').default;
const parseTreeFromArray = require('../../../../../src/services/registration-points/hooks/build-tree').parseTreesFromArray;
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const errors = require('@feathersjs/errors');


describe('Registration Points Service - cascade-removal-to-subtrees', () => {

  describe('parseTreesFromArray', () => {
    it('Should generate correct tree structure when given nodes of a single tree with single child', () => {
      const nodes = [{
        "id": 123,
        "parentId": null,
        "path": null,
        "name": "Registration point"
      }, {
        "id": 124,
        "parentId": 123,
        "path": "123",
        "name": "Registration point"
      }];

      const expected = [{
        "id": 123,
        "parentId": null,
        "path": null,
        "name": "Registration point",
        children: [{
          "id": 124,
          "parentId": 123,
          "path": "123",
          "name": "Registration point"
        }]
      }];

      expect(parseTreeFromArray(nodes)).to.deep.equal(expected);
    });

    it('Should generate correct tree structure when given nodes of a single tree with multiple children', () => {
      const nodes = [{
        "id": 123,
        "parentId": null,
        "path": null,
        "name": "Registration point"
      }, {
        "id": 124,
        "parentId": 123,
        "path": "123",
        "name": "Registration point"
      }, {
        "id": 125,
        "parentId": 123,
        "path": "123",
        "name": "Registration point"
      }];

      const expected = [{
        "id": 123,
        "parentId": null,
        "path": null,
        "name": "Registration point",
        children: [{
          "id": 124,
          "parentId": 123,
          "path": "123",
          "name": "Registration point"
        }, {
          "id": 125,
          "parentId": 123,
          "path": "123",
          "name": "Registration point"
        }]
      }];

      expect(parseTreeFromArray(nodes)).to.deep.equal(expected);
    });

    describe('parseTreesFromArray', () => {
      it('Should generate correct tree structure when given nodes of a single tree with nested children', () => {
        const nodes = [{
          "id": 123,
          "parentId": null,
          "path": null,
          "name": "Registration point"
        }, {
          "id": 124,
          "parentId": 123,
          "path": "123",
          "name": "Registration point"
        }, {
          "id": 125,
          "parentId": 123,
          "path": "123",
          "name": "Registration point"
        }, {
          "id": 130,
          "parentId": 124,
          "path": "123.124",
          "name": "Registration point"
        }, {
          "id": 131,
          "parentId": 124,
          "path": "123.124",
          "name": "Registration point"
        }];

        const expected = [{
          "id": 123,
          "parentId": null,
          "path": null,
          "name": "Registration point",
          children: [{
            "id": 124,
            "parentId": 123,
            "path": "123",
            "name": "Registration point",
            children: [{
              "id": 130,
              "parentId": 124,
              "path": "123.124",
              "name": "Registration point"
            }, {
              "id": 131,
              "parentId": 124,
              "path": "123.124",
              "name": "Registration point"
            }]
          }, {
            "id": 125,
            "parentId": 123,
            "path": "123",
            "name": "Registration point"
          }]
        }];

        expect(parseTreeFromArray(nodes)).to.deep.equal(expected);
      });

      it('Should generate correct tree structures when given nodes of multiple trees', () => {
        const nodes = [{
          "id": 123,
          "parentId": null,
          "path": null,
          "name": "Registration point"
        }, {
          "id": 124,
          "parentId": 123,
          "path": "123",
          "name": "Registration point"
        }, {
          "id": 130,
          "parentId": 124,
          "path": "123.124",
          "name": "Registration point"
        }, {
          "id": 109,
          "parentId": 123,
          "path": "123",
          "name": "Registration point"
        }, {
          "id": 1,
          "parentId": null,
          "path": null,
          "name": "Registration point"
        }, {
          "id": 2,
          "parentId": 1,
          "path": "1",
          "name": "Registration point"
        }, {
          "id": 3,
          "parentId": 2,
          "path": "1.2",
          "name": "Registration point"
        }, {
          "id": 4,
          "parentId": 2,
          "path": "1.2",
          "name": "Registration point"
        }];

        const expected = [{
          "id": 123,
          "parentId": null,
          "path": null,
          "name": "Registration point",
          children: [{
            "id": 124,
            "parentId": 123,
            "path": "123",
            "name": "Registration point",
            children: [{
              "id": 130,
              "parentId": 124,
              "path": "123.124",
              "name": "Registration point"
            }]
          }, {
            "id": 109,
            "parentId": 123,
            "path": "123",
            "name": "Registration point"
          }]
        }, {
          "id": 1,
          "parentId": null,
          "path": null,
          "name": "Registration point",
          children: [{
            "id": 2,
            "parentId": 1,
            "path": "1",
            "name": "Registration point",
            children: [{
              "id": 3,
              "parentId": 2,
              "path": "1.2",
              "name": "Registration point"
            }, {
              "id": 4,
              "parentId": 2,
              "path": "1.2",
              "name": "Registration point"
            }]
          }]
        }];

        expect(parseTreeFromArray(nodes)).to.deep.equal(expected);
      });
    });

    describe('hook', () => {

      it('Should pass when given a GET request and a single node', () => {
        const mockHook = {
          app,
          method: 'get',
          params: {},
          result: {
            "id": 123,
            "parentId": null,
            "path": null,
            "name": "Registration point"
          }
        };

        const expected = {
          "id": 123,
          "parentId": null,
          "path": null,
          "name": "Registration point"
        };

        const outHook = buildTree()(mockHook);
        expect(outHook.result).to.deep.equal(expected);
      });

      it('Should pass when given a FIND request and an array of single node', () => {
        const mockHook = {
          app,
          method: 'find',
          params: {},
          result: [{
            "id": 123,
            "parentId": null,
            "path": null,
            "name": "Registration point"
          }]
        };

        const expected = [{
          "id": 123,
          "parentId": null,
          "path": null,
          "name": "Registration point"
        }];

        const outHook = buildTree()(mockHook);
        expect(outHook.result).to.deep.equal(expected);
      });

      it('Should pass when given a GET request and an array of a single tree nodes', () => {
        const mockHook = {
          app,
          method: 'get',
          params: {},
          result: [{
            "id": 123,
            "parentId": null,
            "path": null,
            "name": "Registration point"
          }, {
            "id": 124,
            "parentId": 123,
            "path": "123",
            "name": "Registration point"
          }, {
            "id": 130,
            "parentId": 124,
            "path": "123.124",
            "name": "Registration point"
          }, {
            "id": 109,
            "parentId": 123,
            "path": "123",
            "name": "Registration point"
          }]
        };

        const expected = {
          "id": 123,
          "parentId": null,
          "path": null,
          "name": "Registration point",
          children: [{
            "id": 124,
            "parentId": 123,
            "path": "123",
            "name": "Registration point",
            children: [{
              "id": 130,
              "parentId": 124,
              "path": "123.124",
              "name": "Registration point"
            }]
          }, {
            "id": 109,
            "parentId": 123,
            "path": "123",
            "name": "Registration point"
          }]
        };

        const outHook = buildTree()(mockHook);
        expect(outHook.result).to.deep.equal(expected);
      });

      it('Should pass when given a FIND request and an array of multiple tree nodes', () => {
        const mockHook = {
          app,
          method: 'find',
          params: {},
          result: [{
            "id": 123,
            "parentId": null,
            "path": null,
            "name": "Registration point"
          }, {
            "id": 124,
            "parentId": 123,
            "path": "123",
            "name": "Registration point"
          }, {
            "id": 130,
            "parentId": 124,
            "path": "123.124",
            "name": "Registration point"
          }, {
            "id": 109,
            "parentId": 123,
            "path": "123",
            "name": "Registration point"
          }, {
            "id": 1,
            "parentId": null,
            "path": null,
            "name": "Registration point"
          }, {
            "id": 2,
            "parentId": 1,
            "path": "1",
            "name": "Registration point"
          }, {
            "id": 3,
            "parentId": 2,
            "path": "1.2",
            "name": "Registration point"
          }, {
            "id": 4,
            "parentId": 2,
            "path": "1.2",
            "name": "Registration point"
          }]
        };

        const expected = [{
          "id": 123,
          "parentId": null,
          "path": null,
          "name": "Registration point",
          children: [{
            "id": 124,
            "parentId": 123,
            "path": "123",
            "name": "Registration point",
            children: [{
              "id": 130,
              "parentId": 124,
              "path": "123.124",
              "name": "Registration point"
            }]
          }, {
            "id": 109,
            "parentId": 123,
            "path": "123",
            "name": "Registration point"
          }]
        }, {
          "id": 1,
          "parentId": null,
          "path": null,
          "name": "Registration point",
          children: [{
            "id": 2,
            "parentId": 1,
            "path": "1",
            "name": "Registration point",
            children: [{
              "id": 3,
              "parentId": 2,
              "path": "1.2",
              "name": "Registration point"
            }, {
              "id": 4,
              "parentId": 2,
              "path": "1.2",
              "name": "Registration point"
            }]
          }]
        }];

        const outHook = buildTree()(mockHook);
        expect(outHook.result).to.deep.equal(expected);
      });

      it('Should throw error when given a GET request and multiple trees', () => {
        const mockHook = {
          app,
          method: 'get',
          params: {},
          result: [{
            "id": 123,
            "parentId": null,
            "path": null,
            "name": "Registration point"
          }, {
            "id": 124,
            "parentId": 123,
            "path": "123",
            "name": "Registration point"
          }, {
            "id": 99,
            "parentId": null,
            "path": null,
            "name": "Registration point"
          }]
        };

        expect(() => buildTree()(mockHook)).to.throw(errors.GeneralError);
      });
    });
  });
});
