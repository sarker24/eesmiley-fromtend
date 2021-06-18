'use strict';

const app = require('../../../../../src/app').default;
const expect = require('chai').expect;
const sinon = require('sinon');
const patchActionEntity = require('../../../../../src/services/projects/hooks/patch-action-entity').default;

describe('Projects Service - patch-action-entity hook', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('should update the "action" property value with action with id and customer/user data when action is passed w/o "id"', () => {
    const action1 = {
      name: 'aaaaaaa',
      description: 'asdasdasdasd'
    };

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      params: {},
      data: {
        name: "Some Project",
        actions: [
          action1
        ]
      },
      operations: [
        {
          op: "doesn't matter",
          path: "/actions/0",
          value: "doesn't matter"
        }
      ]
    };

    sandbox.stub(app.service('actions'), 'create')
      .returns(Promise.resolve({
        id: 10005,
        name: action1.name,
        description: action1.description,
        customerId: 1,
        userId: 1
      }));

    patchActionEntity()(mockHook)
      .then((hook) => {
        const actions = hook.data.actions;

        expect(actions.length).to.equal(1);
        expect(Object.keys(actions[0]).length).to.equal(5);

        expect(actions[0].id).to.equal(10005);
        expect(actions[0].name).to.equal(action1.name);
        expect(actions[0].description).to.equal(action1.description);
        expect(actions[0].customerId).to.equal(1);
        expect(actions[0].userId).to.equal(1);


      });
  });

  it('should update the "action" property value with changed name/description/customer/user data when action is passed with "id"', () => {
    const actionBefore = {
      id: 9,
      name: 'aaaaaaa'
    };
    const actionAfter = {
      id: 9,
      name: 'mah nigguh',
      description: 'yo'
    };

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      params: {},
      data: {
        name: "Some Project",
        actions: [
          actionBefore
        ]
      },
      operations: [
        {
          op: "doesn't matter",
          path: "/actions/0",
          value: "doesn't matter"
        }
      ]
    };

    sandbox.stub(app.service('actions'), 'patch')
      .returns(Promise.resolve({
        id: actionAfter.id,
        name: actionAfter.name,
        description: actionAfter.description,
        customerId: 1,
        userId: 1
      }));

    return patchActionEntity()(mockHook)
      .then((hook) => {
        const actions = hook.data.actions;

        expect(actions.length).to.equal(1);
        expect(Object.keys(actions[0]).length).to.equal(5);

        expect(actions[0].id).to.equal(9);
        expect(actions[0].name).to.equal(actionAfter.name);
        expect(actions[0].description).to.equal(actionAfter.description);
        expect(actions[0].customerId).to.equal(1);
        expect(actions[0].userId).to.equal(1);
      });
  });

  it('should update the "action" property value with a newly created action when action is passed with "id" but does not exist in entity table', () => {
    const actionBefore = {
      id: 9,
      name: 'aaaaaaa'
    };
    const actionAfter = {
      id: 10005,
      name: 'aaaaaaa',
      description: 'yo'
    };

    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      params: {},
      data: {
        name: "Some Project",
        actions: [
          actionBefore
        ]
      },
      operations: [
        {
          op: "doesn't matter",
          path: "/actions/0",
          value: "doesn't matter"
        }
      ]
    };

    sandbox.stub(app.service('actions'), 'patch')
      .returns(Promise.reject({ name: 'NotFound' }));

    sandbox.stub(app.service('actions'), 'create')
      .returns(Promise.resolve({
        id: actionAfter.id,
        name: actionAfter.name,
        description: actionAfter.description,
        customerId: 1,
        userId: 1
      }));

    return patchActionEntity()(mockHook)
      .then((hook) => {
        const actions = hook.data.actions;

        expect(actions.length).to.equal(1);
        expect(Object.keys(actions[0]).length).to.equal(5);

        expect(actions[0].id).to.equal(actionAfter.id);
        expect(actions[0].name).to.equal(actionAfter.name);
        expect(actions[0].description).to.equal(actionAfter.description);
        expect(actions[0].customerId).to.equal(1);
        expect(actions[0].userId).to.equal(1);
      });
  });

});
