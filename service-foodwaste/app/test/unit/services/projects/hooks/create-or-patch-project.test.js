'use strict';

const app = require('../../../../../src/app').default;
const chai = require('chai');
const sinon = require('sinon');
const createOrPatch = require('../../../../../src/services/projects/hooks/create-or-patch-project');
const createOrPatchHook = createOrPatch.default;

const expect = chai.expect;

describe('Projects Service - create-or-patch-project hook', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  let resultMock;

  let resultStub;

  beforeEach(() => {
    resultMock = {
      id: 1,
      registrationPoints: [
        { id: 1 },
        { id: 2 }
      ]
    };
    // stub project db call used for building the response
    resultStub = sandbox.stub(sequelize.models.project, 'findOne').resolves(resultMock);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should skip when given method is not CREATE or PATCH', async () => {
    const mockHook = {
      type: 'before',
      method: 'find',
      app: app,
      params: {},
      data: {}
    };

    const outHook = await createOrPatchHook()(mockHook);
    expect(outHook).to.deep.equal(mockHook);

  });

  it('Should create project successfully', async () => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      params: {},
      data: {
        name: "new Project",
        duration: {
          "end": 1502440455,
          "type": "CALENDAR",
          "start": 1502143200
        },
        registrationPoints: [
          { id: 1 }, { id: 2 }
        ]
      }
    };

    const projectStub = {
      id: 1,
      addRegistrationPoints: sandbox.stub().resolves(sandbox.stub()),
      save: sandbox.stub().resolves(sandbox.stub())
    };

    sandbox.stub(sequelize, 'transaction').callsFake(args => args());

    const createStub = sandbox.stub(sequelize.models.project, 'create').resolves(projectStub);
    const outHook = await createOrPatchHook()(mockHook);
    expect(createStub.calledOnce).to.equal(true);
    expect(projectStub.addRegistrationPoints.calledOnce).to.equal(true);
    expect(projectStub.save.calledOnce).to.equal(true);
    expect(resultStub.calledOnce).to.equal(true);
    expect(resultStub.args[0][0].where.id === 1).to.equal(true);
    expect(outHook.result).to.deep.equal(resultMock);

  });

  it('Should patch project successfully', async () => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      params: {},
      data: {
        id: 1,
        name: "new Project",
        duration: {
          "end": 1502440455,
          "type": "CALENDAR",
          "start": 1502143200
        },
        registrationPoints: [
          { id: 1 }, { id: 2 }, { id: 3 }
        ]
      }
    };

    resultMock.registrationPoints.push({ id: 3 });

    const projectStub = {
      id: 1,
      setRegistrationPoints: sandbox.stub().resolves(sandbox.stub()),
      addRegistrationPoints: sandbox.stub().resolves(sandbox.stub())
    };

    sandbox.stub(sequelize, 'transaction').callsFake(args => args());

    const updateStub = sandbox.stub(sequelize.models.project, 'update').resolves([1, [projectStub]]);
    const outHook = await createOrPatchHook()(mockHook);
    expect(updateStub.calledOnce).to.equal(true);
    expect(resultStub.calledOnce).to.equal(true);
    expect(projectStub.setRegistrationPoints.calledOnce).to.equal(true);
    expect(projectStub.addRegistrationPoints.calledOnce).to.equal(true);
    expect(resultStub.args[0][0].where.id === 1).to.equal(true);
    expect(outHook.result).to.deep.equal(resultMock);

  });

  it('Should throw correct error when create fails', async () => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      params: {},
      data: {
        name: "new Project",
        duration: {
          "end": 1502440455,
          "type": "CALENDAR",
          "start": 1502143200
        },
        registrationPoints: [
          { id: 1 }, { id: 2 }
        ]
      }
    };

    sandbox.stub(sequelize, 'transaction').returns(Promise.reject({ error: 'not gonna work' }));

    try {
      await createOrPatchHook()(mockHook);
      assert.fail('expected error to be thrown');
    } catch(error) {
      expect(error.data.errorCode).to.equal('E265');
      expect(error.message).to.equal('Could not create Project')
    }

  });

  it('Should throw correct error when patch fails', async () => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      params: {},
      data: {
        name: "new Project",
        duration: {
          "end": 1502440455,
          "type": "CALENDAR",
          "start": 1502143200
        },
        registrationPoints: [
          { id: 1 }, { id: 2 }
        ]
      }
    };

    sandbox.stub(sequelize, 'transaction').returns(Promise.reject({ error: 'not gonna work' }));

    try {
      await createOrPatchHook()(mockHook);
      assert.fail('expected error to be thrown');
    } catch(error) {
      expect(error.data.errorCode).to.equal('E265');
      expect(error.message).to.equal('Could not patch Project')
    }
  });
});
