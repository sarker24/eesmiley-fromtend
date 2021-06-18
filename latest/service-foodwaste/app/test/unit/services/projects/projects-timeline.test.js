'use strict';

const app = require('../../../../src/app').default;
const ProjectsTimeline = require('../../../../src/services/projects/projects-timeline').default;
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const moment = require('moment').utc;

describe('Projects Timeline endpoint', () => {
  const Timeline = new ProjectsTimeline(app);
  const sandbox = sinon.createSandbox();
  let element, project, elementsForSorting;

  beforeEach(() => {
    element = {
      createdAt: '2018-10-01 23:41:54',
      data: {
        date: '2018-10-30 12:13:14',
        duration: {
          start: 1539616577
        }
      }
    };

    elementsForSorting = [
      {
        "period": 2,
        "type": "registration",
        "createdAt": "2018-09-03",
        "data": {
          "date": "2018-09-03",
          "createdAt": "2018-09-03 16:47:00.756+00"
        }
      },
      {
        "period": 2,
        "type": "registration",
        "createdAt": "2018-09-04",
        "data": {
          "date": "2018-09-04",
          "createdAt": "2018-09-04 16:47:00.756+00"
        }
      },
      {
        "period": 2,
        "type": "action",
        "createdAt": "2018-09-05",
        "data": {
          "id": 1,
          "createdAt": "2018-09-05"
        }
      },
      {
        "period": 2,
        "type": "project",
        "createdAt": "2018-09-02",
        "data": {
          "createdAt": "2018-09-03 16:46:00.756+00",
          "duration": {
            "days": 1,
            "type": "REGISTRATIONS",
            "start": 1535846400
          }
        }
      },
      {
        "period": 2,
        "type": "registration",
        "createdAt": "2018-09-07",
        "data": {
          "date": "2018-09-07",
          "createdAt": "2018-09-06 16:47:00.756+00"
        }
      },
      {
        "period": 2,
        "type": "period",
        "createdAt": "2018-09-05",
        "data": {
          "createdAt": "2018-09-06 16:46:00.756+00",
          "duration": {
            "days": 1,
            "type": "REGISTRATIONS",
            "start": 1536192000
          }
        }
      }
    ];

    project = {
      createdAt: '2018-09-03 16:46:00.756+00',
      updatedAt: '2018-09-05 16:46:00.756+00',
      deletedAt: null,
      id: '10033',
      parentProjectId: null,
      name: 'Project Name',
      duration: { days: 1, type: 'REGISTRATIONS', start: 1535846400 },
      status: 'RUNNING_FOLLOWUP',
      areas: [],
      period: 2,
      products: [{
        id: '1',
        name: 'food',
        goal: 30
      }],
      actions: [{
        id: 1,
        name: 'Stop cooking bad food'
      }],
      userId: '1',
      customerId: '1',
      active: true,
      registrations: [{
        customerId: 1,
        date: "2018-09-03",
        createdAt: "2018-09-03 16:47:00.756+00",
        userId: 1,
        amount: 1800,
        unit: "kg",
        currency: "DKK",
        cost: 5000,
        comment: "Hello test",
        kgPerLiter: 15,
        manual: true,
        scale: true,
        areaId: 1,
        productId: 1,
        deletedAt: null
      }, {
        customerId: 1,
        date: "2018-09-04",
        createdAt: "2018-09-04 16:47:00.756+00",
        userId: 1,
        amount: 1800,
        unit: "kg",
        currency: "DKK",
        cost: 5000,
        comment: "Hello test",
        kgPerLiter: 15,
        manual: true,
        scale: true,
        areaId: 1,
        productId: 1,
        deletedAt: null
      }],
      followUpProjects: [{
        createdAt: '2018-09-06 16:46:00.756+00',
        updatedAt: '2018-09-06 16:46:00.756+00',
        deletedAt: null,
        id: '10034',
        parentProjectId: '10033',
        name: 'Project Name',
        duration: { days: 1, type: 'REGISTRATIONS', start: 1536192000 },
        status: 'RUNNING',
        areas: [],
        period: 2,
        products: [{
          id: '1',
          name: 'food',
          goal: 30
        }],
        actions: [{
          id: 1,
          name: 'Stop cooking bad food'
        }],
        userId: '1',
        customerId: '1',
        active: true,
        registrations: [{
          customerId: 1,
          date: "2018-09-07",
          createdAt: "2018-09-06 16:47:00.756+00",
          userId: 1,
          amount: 1800,
          unit: "kg",
          currency: "DKK",
          cost: 5000,
          comment: "Hello test",
          kgPerLiter: 15,
          manual: true,
          scale: true,
          areaId: 10001,
          productId: 10001,
          deletedAt: null
        }],
        followUpProjects: []
      }]
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should create a timeline element from a registration', () => {
    const registration = {
      customerId: 1,
      date: "2018-06-01",
      createdAt: "2018-09-06 16:47:00.756+00",
      userId: 1,
      amount: 1800,
      unit: "kg",
      currency: "DKK",
      cost: 5000,
      comment: "Hello test",
      kgPerLiter: 15,
      manual: true,
      scale: true,
      areaId: 10001,
      productId: 10001,
      deletedAt: null
    };

    const timelineElement = ProjectsTimeline.createTimeLineElement(registration, 'registration', 2);

    expect(timelineElement.period).to.equal(2);
    expect(timelineElement.type).to.equal('registration');
    expect(timelineElement.createdAt).to.equal('2018-06-01');
    expect(timelineElement.data).to.deep.equal(registration);
  });

  it('Should create timeline element from a project', () => {
    const timelineElement = ProjectsTimeline.createTimeLineElement(project, 'project', 2);

    expect(timelineElement.period).to.equal(2);
    expect(timelineElement.type).to.equal('project');
    expect(timelineElement.createdAt).to.equal('2018-09-02');
  });

  it('Should return an array of registrations as timeline elements from a project', () => {

    const timelineElements = Timeline.populateRegistrations(project);
    expect(timelineElements.length).to.equal(2);
    expect(timelineElements[0].data).to.deep.equal(project.registrations[0]);
    expect(timelineElements[1].data).to.deep.equal(project.registrations[1]);
    expect(timelineElements[0].type).to.equal('registration');
    expect(timelineElements[1].type).to.equal('registration');
  });

  it('Should return an integer date created from a "createdAt" prop when the element type is "action"', () => {
    element.type = 'action';
    delete element.data;
    const dateAsNumber = moment(element.createdAt).unix();

    expect(dateAsNumber).to.equal(1538437314);

    const date = ProjectsTimeline.getElementDate(element, 'number');

    expect(date).to.equal(dateAsNumber);
  });

  it('Should return an integer date created from a "data.date" prop when the element type is "registration"', () => {
    element.type = 'registration';
    const dateAsNumber = moment(element.data.date).unix();

    expect(dateAsNumber).to.equal(1540901594);

    const date = ProjectsTimeline.getElementDate(element, 'number');

    expect(date).to.equal(dateAsNumber);
  });

  it('Should return an integer date created from a "data.duration.start" prop when the element type is "project"', () => {
    element.type = 'project';
    const dateAsNumber = moment(element.data.duration.start * 1000).unix();

    expect(dateAsNumber).to.equal(1539616577);

    const date = ProjectsTimeline.getElementDate(element, 'number');

    expect(date).to.equal(dateAsNumber);
  });

  it('Should return a string date when asked for such', () => {
    element.type = 'project';

    const date = ProjectsTimeline.getElementDate(element, 'date');

    expect(date).to.equal('2018-10-15');
  });

  it('Should return an array of actions as timeline elements from a project', async () => {
    sandbox.stub(Timeline.app.get('sequelize').models.action, 'findAll')
      .returns(Promise.resolve([{
        id: 1,
        createdAt: '2018-09-05',
        name: 'Stop cooking bad food'
      }]));

    const timelineElements = await Timeline.populateActions(project);

    expect(timelineElements.length).to.equal(1);
    expect(timelineElements[0].period).to.equal(2);
    expect(timelineElements[0].type).to.deep.equal('action');
  });

  it('Should return an error E192 if it fails to retrieve actions from DB to add to timeline', async () => {
    sandbox.stub(Timeline.app.get('sequelize').models.action, 'findAll')
      .returns(Promise.reject([{
        bad: 'stuff'
      }]));

    try {
      await Timeline.populateActions(project);
    } catch (err) {
      expect(err.data.errorCode).to.equal('E192');
    }
  });

  it('Should split a project into an array of timeline elements clasified by type', async () => {
    sandbox.stub(Timeline.app.get('sequelize').models.action, 'findAll')
      .returns(Promise.resolve([{
        id: 1,
        createdAt: '2018-09-05',
        name: 'Stop cooking bad food'
      }]));

    const splittedProjects = await Timeline.splitProjectTreeIntoTimelineElements(project);

    expect(splittedProjects[0].registrations.length).to.equal(2);
    expect(splittedProjects[0].actions.length).to.equal(1);
    expect(splittedProjects[0].project.length).to.equal(1);
    expect(splittedProjects[1].registrations.length).to.equal(1);
    expect(splittedProjects[1].actions.length).to.equal(1);
    expect(splittedProjects[1].project.length).to.equal(1);
  });

  it('Should sort an array of elements according to their dates where the earliest date is the last element in the list', () => {
    ProjectsTimeline.sortTimeline(elementsForSorting);

    expect(elementsForSorting[0].type).to.equal('registration');
    expect(elementsForSorting[0].createdAt).to.equal('2018-09-07');

    expect(elementsForSorting[1].type).to.equal('action');
    expect(elementsForSorting[1].createdAt).to.equal('2018-09-05');

    expect(elementsForSorting[2].type).to.equal('period');
    expect(elementsForSorting[2].createdAt).to.equal('2018-09-05');

    expect(elementsForSorting[3].type).to.equal('registration');
    expect(elementsForSorting[3].createdAt).to.equal('2018-09-04');

    expect(elementsForSorting[4].type).to.equal('registration');
    expect(elementsForSorting[4].createdAt).to.equal('2018-09-03');

    expect(elementsForSorting[5].type).to.equal('project');
    expect(elementsForSorting[5].createdAt).to.equal('2018-09-02');
  });

  it('Should build a timeline from a project', async () => {
    sandbox.stub(Timeline.app.get('sequelize').models.action, 'findAll')
      .returns(Promise.resolve([{
        id: 1,
        createdAt: '2018-09-05',
        name: 'Stop cooking bad food'
      }]));

    const timeline = await Timeline.buildTimeline(project);

    expect(timeline[0].type).to.equal('registration');
    expect(timeline[0].period).to.equal(2);
    expect(timeline[1].type).to.equal('period');
    expect(timeline[1].period).to.equal(2);
    expect(timeline[2].type).to.equal('action');
    expect(timeline[2].period).to.equal(2);
    expect(timeline[3].type).to.equal('registration');
    expect(timeline[3].period).to.equal(2);
    expect(timeline[4].type).to.equal('registration');
    expect(timeline[5].type).to.equal('project');
  });

  it('Should return error E191 if there is an error building the timeline (due to problems with actions)', async () => {
    sandbox.stub(Timeline.app.get('sequelize').models.action, 'findAll')
      .returns(Promise.reject([{
        bad: 'stuff'
      }]));

    try {
      await Timeline.buildTimeline(project);
    } catch (err) {
      expect(err.data.errorCode).to.equal('E191');
    }
  });

  it('Should build a timeline from a project id after hitting /projects/:projectId/timeline', async () => {
    sandbox.stub(Timeline.app.service('projects/:projectId/registrations'), 'find')
      .returns(Promise.resolve(project));
    sandbox.stub(Timeline.app.get('sequelize').models.action, 'findAll')
      .returns(Promise.resolve([{
        id: 1,
        createdAt: '2018-09-05',
        name: 'Stop cooking bad food'
      }]));
    const params = {
      requestId: 'requesto',
      sessionId: 'sessiono',
      route: { projectId: '10033' }
    };

    const timeline = await Timeline.find(params);

    expect(timeline[0].type).to.equal('registration');
    expect(timeline[0].period).to.equal(2);
    expect(timeline[1].type).to.equal('period');
    expect(timeline[1].period).to.equal(2);
    expect(timeline[2].type).to.equal('action');
    expect(timeline[2].period).to.equal(2);
    expect(timeline[3].type).to.equal('registration');
    expect(timeline[3].period).to.equal(1);
    expect(timeline[4].type).to.equal('registration');
    expect(timeline[4].period).to.equal(1);
    expect(timeline[5].type).to.equal('project');
    expect(timeline[5].period).to.equal(1);
  });

  it('Should return error 404 if the project does not exist', async () => {
    sandbox.stub(Timeline.app.service('projects/:projectId/registrations'), 'find')
      .returns(Promise.reject({
        code: 404
      }));
    const params = {
      requestId: 'requesto',
      sessionId: 'sessiono',
      route: { projectId: '10033' }
    };

    try {
      await Timeline.find(params);
    } catch (err) {
      expect(err.code).to.equal(404);
    }
  });

  it('Should return error 500 error code E194 if an error different from 404 occurs getting the projects', async () => {
    sandbox.stub(Timeline.app.service('projects/:projectId/registrations'), 'find')
      .returns(Promise.reject({
        code: 500
      }));
    const params = {
      requestId: 'requesto',
      sessionId: 'sessiono',
      route: { projectId: '10033' }
    };

    try {
      await Timeline.find(params);
    } catch (err) {
      expect(err.code).to.equal(500);
      expect(err.data.errorCode).to.equal('E194');
    }
  });
});

