'use strict';

const app = require('../../../../../src/app').default;
const chai = require('chai');
const cleanProjectRegistrationPoints = require('../../../../../src/services/projects/hooks/clean-project-registration-points').default;
const expect = chai.expect;

describe('Projects Service - clean-project-registration-points hook', () => {

  it('Should remove timestamps from a project', () => {
    const mockHook = {
      type: 'after',
      method: 'get',
      app: app,
      params: {},
      result: {
        "registrationPoints": [
          {
            "id": 1,
            "name": "productA",
            "createdAt": 1,
            "updatedAt": 2,
            "deletedAt": 3
          },
          {
            "id": 2,
            "name": "productB",
            "createdAt": 2,
            "updatedAt": 3
          }
        ]
      }
    };

    const { result: { registrationPoints } } = cleanProjectRegistrationPoints()(mockHook);
    expect(registrationPoints.every(point =>
      !('deletedAt' in point) && !('createdAt' in point) && !('updatedAt' in point))
    ).to.equal(true);
  });

  it('Should remove timestamps from multiple projects', () => {
    const mockHook = {
      type: 'after',
      method: 'find',
      app: app,
      params: {},
      result: [
        {
          "registrationPoints": [
            {
              "id": 1,
              "name": "productA",
              "createdAt": 1,
              "updatedAt": 2,
              "deletedAt": 3
            },
            {
              "id": 2,
              "name": "productB",
              "createdAt": 2,
              "updatedAt": 3
            }
          ]
        },
        {
          "registrationPoints": [
            {
              "id": 3,
              "name": "productC",
              "createdAt": 1
            },
            {
              "id": 4,
              "name": "productD",
              "createdAt": 2,
              "updatedAt": 3
            }
          ]
        }
      ]
    };

    const { result: projects } = cleanProjectRegistrationPoints()(mockHook);
    projects.forEach(({ registrationPoints }) => {
      expect(registrationPoints.every(point =>
        !('deletedAt' in point) && !('createdAt' in point) && !('updatedAt' in point))
      ).to.equal(true);
    });

  });
});
